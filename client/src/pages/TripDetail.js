import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import WeatherCard from "../components/WeatherCard";
import BudgetCard from "../components/BudgetCard";
import MemoriesSection from "../components/MemoriesSection";

const ICONS  = { flight: "✈️", hotel: "🏨", activity: "🎯" };
const COLORS = { flight: "item-flight", hotel: "item-hotel", activity: "item-activity" };

export default function TripDetail() {
  const { id }          = useParams();
  const { token, user } = useAuth();
  const { socket }      = useSocket();
  const navigate        = useNavigate();

  const [items, setItems]               = useState([]);
  const [trip, setTrip]                 = useState(null);
  const [budget, setBudget]             = useState(null);
  const [error, setError]               = useState("");
  const [inviteEmail, setInviteEmail]   = useState("");
  const [inviteMsg, setInviteMsg]       = useState("");
  const [inviteError, setInviteError]   = useState("");
  const [editBudget, setEditBudget]     = useState(false);
  const [budgetInput, setBudgetInput]   = useState("");
  const [notification, setNotification] = useState("");
  const [form, setForm] = useState({
    type: "flight", title: "", date: "",
    time: "", location: "", notes: "", cost: "",
    checkIn: "", checkOut: ""
  });

  const headers = { Authorization: "Bearer " + token };

  const loadBudget = () => {
    axios.get("http://localhost:5000/api/trips/" + id + "/budget", { headers })
      .then(res => setBudget(res.data))
      .catch(() => setBudget({
        budget: 0, spent: 0, remaining: 0,
        percentage: 0,
        breakdown: { flights: 0, hotels: 0, activities: 0 }
      }));
  };

  useEffect(() => {
    axios.get("http://localhost:5000/api/trips/" + id, { headers })
      .then(res => { setTrip(res.data); setBudgetInput(res.data.budget || ""); })
      .catch(() => setError("Failed to load trip"));

    axios.get("http://localhost:5000/api/items/" + id, { headers })
      .then(res => setItems(res.data))
      .catch(() => setError("Failed to load items"));

    loadBudget();
  }, [id, token]);

  // Socket.io
  useEffect(() => {
    if (!socket) return;

    socket.emit("join_trip", id);

    socket.on("item_added", (newItem) => {
      // Only update if added by someone else — not yourself
      if (newItem.addedBy?._id?.toString() === user?.id?.toString()) return;
      setItems(prev => {
        if (prev.find(i => i._id === newItem._id)) return prev;
        return [...prev, newItem].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
      });
      loadBudget();
      showNotification(`✈️ ${newItem.addedBy?.name} added "${newItem.title}"`);
    });

    socket.on("item_deleted", ({ itemId, deletedBy }) => {
      // Only update if deleted by someone else
      if (deletedBy === user?.id?.toString()) return;
      setItems(prev => prev.filter(i => i._id !== itemId));
      loadBudget();
      showNotification("🗑️ An item was removed by a collaborator");
    });

    socket.on("item_updated", (updatedItem) => {
      setItems(prev => prev.map(i =>
        i._id === updatedItem._id ? updatedItem : i
      ));
      loadBudget();
    });

    socket.on("trip_updated", (updatedTrip) => {
      setTrip(updatedTrip);
      loadBudget();
      showNotification("✏️ Trip details were updated");
    });

    socket.on("collaborator_added", (updatedTrip) => {
      setTrip(updatedTrip);
      showNotification("👥 A new collaborator joined the trip!");
    });

    return () => {
      socket.emit("leave_trip", id);
      socket.off("item_added");
      socket.off("item_deleted");
      socket.off("item_updated");
      socket.off("trip_updated");
      socket.off("collaborator_added");
    };
  }, [socket, id]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  const saveBudget = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "http://localhost:5000/api/trips/" + id + "/budget",
        { budget: Number(budgetInput) },
        { headers }
      );
      setTrip(prev => ({ ...prev, budget: Number(budgetInput) }));
      setEditBudget(false);
      loadBudget();
    } catch {
      setError("Failed to save budget");
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/items",
        { ...form, trip: id, cost: Number(form.cost) || 0 },
        { headers }
      );
      setItems(prev => [...prev, res.data]);
      setForm({
        type: "flight", title: "", date: "",
        time: "", location: "", notes: "", cost: "",
        checkIn: "", checkOut: ""
      });
      loadBudget();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to add item");
    }
  };

  const deleteItem = async (itemId) => {
    await axios.delete("http://localhost:5000/api/items/" + itemId, { headers });
    setItems(prev => prev.filter(i => i._id !== itemId));
    loadBudget();
  };

  const inviteCollaborator = async (e) => {
    e.preventDefault();
    setInviteMsg(""); setInviteError("");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/trips/" + id + "/invite",
        { email: inviteEmail }, { headers }
      );
      setTrip(res.data);
      setInviteMsg("Successfully invited " + inviteEmail);
      setInviteEmail("");
    } catch (err) {
      setInviteError(err.response?.data?.msg || "Invite failed");
    }
  };

  const isTripCompleted = () => {
    if (!trip?.endDate) return false;
    return new Date() > new Date(trip.endDate);
  };

  // Build trip members — exclude current user
  const tripMembers = (() => {
    const everyone = [
      trip?.owner,
      ...(trip?.collaborators || [])
    ].filter(Boolean);
    return everyone.filter(
      p => p._id?.toString() !== user?.id?.toString()
    );
  })();

  // Calculate nights for hotel
  const calcNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );
  };

  return (
    <div className="trip-detail">

      {/* Real-time Notification Toast */}
      {notification && (
        <div style={{
          position: "fixed", top: "80px", right: "20px",
          background: "#1a1a2e", color: "white",
          padding: "12px 20px", borderRadius: "12px",
          fontSize: "14px", fontWeight: "600",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          zIndex: 1000, animation: "slideIn 0.3s ease",
          display: "flex", alignItems: "center", gap: "8px",
          maxWidth: "320px"
        }}>
          <span style={{
            width: "8px", height: "8px",
            background: "#10b981", borderRadius: "50%",
            flexShrink: 0, animation: "pulse 1s infinite"
          }}/>
          {notification}
        </div>
      )}

      {/* Back Button */}
      <button className="btn-back" onClick={() => navigate("/dashboard")}>
        ← Back to Trips
      </button>

      {/* Trip Header */}
      {trip && (
        <div className="trip-detail-header">
          <div style={{
            display: "flex", alignItems: "center",
            gap: "12px", flexWrap: "wrap"
          }}>
            <h2>{trip.title}</h2>
            <span style={{
              display: "flex", alignItems: "center", gap: "4px",
              background: "#f0fdf8", color: "#10b981",
              padding: "4px 10px", borderRadius: "20px",
              fontSize: "11px", fontWeight: "700",
              border: "1px solid #bbf7d0"
            }}>
              <span style={{
                width: "6px", height: "6px",
                background: "#10b981", borderRadius: "50%"
              }}/>
              LIVE
            </span>
          </div>
          <p>📍 {trip.destination || "No destination"}</p>
        </div>
      )}

      {/* Weather */}
      {trip?.destination && (
        <WeatherCard destination={trip.destination} />
      )}

      {error && <div className="error-msg">{error}</div>}

      {/* Budget Card */}
      <BudgetCard budget={budget} />

      {/* Set / Edit Budget */}
      <div className="add-item-card" style={{ marginBottom: "24px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h3>
            💰 {trip?.budget > 0
              ? "Budget: ₹" + Number(trip.budget).toLocaleString()
              : "Set Trip Budget"}
          </h3>
          <button
            onClick={() => setEditBudget(!editBudget)}
            style={{
              background: "transparent",
              border: "1.5px solid #4f46e5",
              color: "#4f46e5", padding: "6px 16px",
              borderRadius: "8px", cursor: "pointer",
              fontWeight: "600", fontSize: "13px"
            }}
          >
            {editBudget ? "Cancel" : trip?.budget > 0 ? "Edit Budget" : "Set Budget"}
          </button>
        </div>
        {editBudget && (
          <form
            onSubmit={saveBudget}
            style={{ display: "flex", gap: "10px", marginTop: "14px" }}
          >
            <input
              type="number"
              placeholder="Enter total budget in ₹"
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              min="0"
              style={{ flex: 1, margin: 0 }}
              required
            />
            <button type="submit" className="btn-invite">
              💾 Save
            </button>
          </form>
        )}
      </div>

      {/* Trip Members */}
      <div className="collaborators-card">
        <h3>👥 Trip Members</h3>
        <div className="collab-list">
          {tripMembers.length === 0 ? (
            <p className="collab-empty">No other members yet</p>
          ) : (
            tripMembers.map(person => (
              <div key={person._id} className="collab-item">
                <div className="collab-avatar">
                  {person.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p className="collab-name">
                    {person.name}
                    {trip?.owner?._id?.toString() === person._id?.toString() && (
                      <span style={{
                        marginLeft: "8px",
                        background: "#ede9fe",
                        color: "#4f46e5",
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "20px"
                      }}>
                        Owner
                      </span>
                    )}
                  </p>
                  <p className="collab-email">{person.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <form className="invite-form" onSubmit={inviteCollaborator}>
          <input
            type="email"
            placeholder="Enter collaborator email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn-invite">+ Invite</button>
        </form>
        {inviteMsg   && <p className="invite-success">{inviteMsg}</p>}
        {inviteError && (
          <div className="error-msg" style={{ marginTop: "10px" }}>
            {inviteError}
          </div>
        )}
      </div>

      {/* Add Item Form */}
      <div className="add-item-card">
        <h3>➕ Add to Timeline</h3>
        <form className="add-item-form" onSubmit={addItem}>

          {/* Type */}
          <select
            style={{ gridColumn: "span 2" }}
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
          >
            <option value="flight">✈️ Flight</option>
            <option value="hotel">🏨 Hotel</option>
            <option value="activity">🎯 Activity</option>
          </select>

          {/* Title */}
          <input
            placeholder={
              form.type === "hotel" ? "Hotel name (e.g. Al Jaz Hotel)" :
              form.type === "flight" ? "Flight (e.g. Flight to Dubai)" :
              "Activity (e.g. Burj Khalifa Visit)"
            }
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />

          {/* Cost */}
          <input
            type="number"
            placeholder="Cost in ₹ (optional)"
            value={form.cost}
            onChange={e => setForm({ ...form, cost: e.target.value })}
            min="0"
          />

          {/* Hotel — Check In / Check Out */}
          {form.type === "hotel" ? (
            <>
              <div>
                <label className="input-label">🟢 Check-in Date</label>
                <input
                  type="date"
                  value={form.checkIn}
                  onChange={e => setForm({
                    ...form,
                    checkIn: e.target.value,
                    date: e.target.value
                  })}
                  style={{ margin: 0 }}
                />
              </div>
              <div>
                <label className="input-label">🔴 Check-out Date</label>
                <input
                  type="date"
                  value={form.checkOut}
                  onChange={e => setForm({ ...form, checkOut: e.target.value })}
                  style={{ margin: 0 }}
                />
              </div>

              {/* Show nights preview */}
              {form.checkIn && form.checkOut && calcNights(form.checkIn, form.checkOut) > 0 && (
                <div style={{
                  gridColumn: "span 2",
                  background: "#f0fdf8", border: "1px solid #bbf7d0",
                  borderRadius: "8px", padding: "10px 14px",
                  fontSize: "13px", color: "#10b981", fontWeight: "600"
                }}>
                  🌙 {calcNights(form.checkIn, form.checkOut)} night
                  {calcNights(form.checkIn, form.checkOut) !== 1 ? "s" : ""} stay
                </div>
              )}
            </>
          ) : (
            /* Flight / Activity — date + time */
            <>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
              <input
                type="time"
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
              />
            </>
          )}

          {/* Location */}
          <input
            placeholder="Location"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
          />

          {/* Notes */}
          <input
            placeholder="Notes"
            style={{ gridColumn: "span 2" }}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />

          <button
            type="submit"
            className="btn-primary"
            style={{ gridColumn: "span 2" }}
          >
            + Add Item
          </button>
        </form>
      </div>

      {/* Timeline */}
      <div className="timeline">
        <h3>📅 Timeline</h3>
        {items.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: "36px", marginBottom: "12px" }}>🗓️</p>
            <p>No items yet — add a flight, hotel or activity!</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item._id} className={"timeline-item " + COLORS[item.type]}>
              <div className="item-icon">{ICONS[item.type]}</div>
              <div className="item-body">
                <strong>{item.title}</strong>
                <p>📍 {item.location || "No location"}</p>

                {/* Hotel — check in/out + nights */}
                {item.type === "hotel" ? (
                  <div style={{ marginTop: "4px" }}>
                    {item.checkIn && (
                      <p>
                        🟢 Check-in:{" "}
                        <strong style={{ color: "#10b981" }}>
                          {new Date(item.checkIn).toDateString()}
                        </strong>
                      </p>
                    )}
                    {item.checkOut && (
                      <p>
                        🔴 Check-out:{" "}
                        <strong style={{ color: "#e53e3e" }}>
                          {new Date(item.checkOut).toDateString()}
                        </strong>
                      </p>
                    )}
                    {item.checkIn && item.checkOut &&
                      calcNights(item.checkIn, item.checkOut) > 0 && (
                      <p style={{
                        fontSize: "12px", color: "#4f46e5",
                        fontWeight: "700", marginTop: "4px"
                      }}>
                        🌙 {calcNights(item.checkIn, item.checkOut)} night
                        {calcNights(item.checkIn, item.checkOut) !== 1 ? "s" : ""} stay
                      </p>
                    )}
                    {/* Fallback if no checkIn/checkOut */}
                    {!item.checkIn && !item.checkOut && item.date && (
                      <p>📅 {new Date(item.date).toDateString()}</p>
                    )}
                  </div>
                ) : (
                  /* Flight / Activity */
                  <p>
                    📅 {item.date
                      ? new Date(item.date).toDateString()
                      : "No date"}
                    {item.time && " at " + item.time}
                  </p>
                )}

                {item.notes && <p>📝 {item.notes}</p>}
                {item.cost > 0 && (
                  <p style={{
                    color: "#4f46e5", fontWeight: "700",
                    fontSize: "13px", marginTop: "4px"
                  }}>
                    💰 ₹{item.cost.toLocaleString()}
                  </p>
                )}
                <small>Added by {item.addedBy?.name || "Unknown"}</small>
              </div>
              <button
                className="btn-delete"
                onClick={() => deleteItem(item._id)}
              >✕</button>
            </div>
          ))
        )}
      </div>

      {/* Memories */}
      <MemoriesSection
        tripId={id}
        token={token}
        isCompleted={isTripCompleted()}
      />

    </div>
  );
}