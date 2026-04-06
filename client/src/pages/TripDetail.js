import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const ICONS = { flight: "✈️", hotel: "🏨", activity: "🎯" };
const COLORS = { flight: "item-flight", hotel: "item-hotel", activity: "item-activity" };
export default function TripDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [form, setForm] = useState({ type: "flight", title: "", date: "", time: "", location: "", notes: "" });
  const headers = { Authorization: "Bearer " + token };
  useEffect(() => {
    axios.get("http://localhost:5000/api/trips/" + id, { headers }).then(res => setTrip(res.data)).catch(() => setError("Failed to load trip"));
    axios.get("http://localhost:5000/api/items/" + id, { headers }).then(res => setItems(res.data)).catch(() => setError("Failed to load items"));
  }, [id, token]);
  const addItem = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/items", { ...form, trip: id }, { headers });
      setItems([...items, res.data]);
      setForm({ type: "flight", title: "", date: "", time: "", location: "", notes: "" });
    } catch (err) { setError(err.response?.data?.msg || "Failed to add item"); }
  };
  const deleteItem = async (itemId) => {
    await axios.delete("http://localhost:5000/api/items/" + itemId, { headers });
    setItems(items.filter(i => i._id !== itemId));
  };
  const inviteCollaborator = async (e) => {
    e.preventDefault();
    setInviteMsg(""); setInviteError("");
    try {
      const res = await axios.post("http://localhost:5000/api/trips/" + id + "/invite", { email: inviteEmail }, { headers });
      setTrip(res.data);
      setInviteMsg("Successfully invited " + inviteEmail);
      setInviteEmail("");
    } catch (err) { setInviteError(err.response?.data?.msg || "Invite failed"); }
  };
  return (
    <div className="trip-detail">
      <button className="btn-back" onClick={() => navigate("/dashboard")}>Back to Trips</button>
      {trip && <div className="trip-detail-header"><h2>{trip.title}</h2><p>📍 {trip.destination || "No destination"}</p></div>}
      {error && <div className="error-msg">{error}</div>}
      <div className="collaborators-card">
        <h3>👥 Collaborators</h3>
        <div className="collab-list">
          {trip?.collaborators?.length === 0 ? (
            <p className="collab-empty">No collaborators yet</p>
          ) : (
            trip?.collaborators?.map(c => (
              <div key={c._id} className="collab-item">
                <div className="collab-avatar">{c.name.charAt(0).toUpperCase()}</div>
                <div><p className="collab-name">{c.name}</p><p className="collab-email">{c.email}</p></div>
              </div>
            ))
          )}
        </div>
        <form className="invite-form" onSubmit={inviteCollaborator}>
          <input type="email" placeholder="Enter collaborator email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
          <button type="submit" className="btn-invite">+ Invite</button>
        </form>
        {inviteMsg && <p className="invite-success">{inviteMsg}</p>}
        {inviteError && <div className="error-msg" style={{ marginTop: "10px" }}>{inviteError}</div>}
      </div>
      <div className="add-item-card">
        <h3>Add to Timeline</h3>
        <form className="add-item-form" onSubmit={addItem}>
          <select style={{ gridColumn: "span 2" }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="flight">✈️ Flight</option>
            <option value="hotel">🏨 Hotel</option>
            <option value="activity">🎯 Activity</option>
          </select>
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <input placeholder="Notes" style={{ gridColumn: "span 2" }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <button type="submit" className="btn-primary" style={{ gridColumn: "span 2" }}>+ Add Item</button>
        </form>
      </div>
      <div className="timeline">
        <h3>Timeline</h3>
        {items.length === 0 ? (
          <div className="empty-state"><p>No items yet. Add a flight, hotel or activity!</p></div>
        ) : (
          items.map(item => (
            <div key={item._id} className={"timeline-item " + COLORS[item.type]}>
              <div className="item-icon">{ICONS[item.type]}</div>
              <div className="item-body">
                <strong>{item.title}</strong>
                <p>📍 {item.location || "No location"}</p>
                <p>📅 {item.date ? new Date(item.date).toDateString() : "No date"}{item.time && " at " + item.time}</p>
                {item.notes && <p>📝 {item.notes}</p>}
                <small>Added by {item.addedBy?.name || "Unknown"}</small>
              </div>
              <button className="btn-delete" onClick={() => deleteItem(item._id)}>✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
