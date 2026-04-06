import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ── Status badge helper ──────────────────────────────
function getTripStatus(startDate, endDate) {
  const now   = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end   = endDate   ? new Date(endDate)   : null;
  if (!start) return { label: "No Date",   color: "#888",    bg: "#f5f5f5" };
  if (now < start)         return { label: "Upcoming",  color: "#4f46e5", bg: "#ede9fe" };
  if (end && now > end)    return { label: "Completed", color: "#10b981", bg: "#d1fae5" };
  return                          { label: "Ongoing",   color: "#f59e0b", bg: "#fef3c7" };
}

// ── Days countdown helper ────────────────────────────
function getDaysMessage(startDate, endDate) {
  const now   = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end   = endDate   ? new Date(endDate)   : null;
  if (!start) return null;
  const diffStart = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
  const diffEnd   = Math.ceil((now - end)   / (1000 * 60 * 60 * 24));
  if (now < start) {
    if (diffStart === 0) return "🚀 Trip starts today!";
    if (diffStart === 1) return "🚀 Trip starts tomorrow!";
    return `⏳ ${diffStart} days until trip`;
  }
  if (end && now > end) return `✅ Ended ${diffEnd} day${diffEnd !== 1 ? "s" : ""} ago`;
  return "🌍 Trip is ongoing!";
}

// ── Item Summary Badge ───────────────────────────────
function ItemSummary({ summary }) {
  if (!summary) return (
    <p style={{ fontSize: "12px", color: "#bbb", marginTop: "8px" }}>
      Loading items...
    </p>
  );
  if (summary.total === 0) return (
    <p style={{ fontSize: "12px", color: "#bbb", marginTop: "8px" }}>
      No items added yet
    </p>
  );
  return (
    <div style={{
      display: "flex", gap: "12px", marginTop: "10px",
      flexWrap: "wrap"
    }}>
      {summary.flights > 0 && (
        <span style={badgeStyle("#eff6ff", "#3b82f6")}>
          ✈️ {summary.flights} flight{summary.flights !== 1 ? "s" : ""}
        </span>
      )}
      {summary.hotels > 0 && (
        <span style={badgeStyle("#f0fdf8", "#10b981")}>
          🏨 {summary.hotels} hotel{summary.hotels !== 1 ? "s" : ""}
        </span>
      )}
      {summary.activities > 0 && (
        <span style={badgeStyle("#fffdf0", "#f59e0b")}>
          🎯 {summary.activities} activit{summary.activities !== 1 ? "ies" : "y"}
        </span>
      )}
    </div>
  );
}

function badgeStyle(bg, color) {
  return {
    background: bg,
    color: color,
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    border: "1px solid " + color + "44"
  };
}

export default function Dashboard() {
  const [trips, setTrips]         = useState([]);
  const [summaries, setSummaries] = useState({});
  const [search, setSearch]       = useState("");
  const [form, setForm]           = useState({ title: "", destination: "", startDate: "", endDate: "" });
  const [showForm, setShowForm]   = useState(false);
  const [error, setError]         = useState("");
  const { token }                 = useAuth();
  const navigate                  = useNavigate();

  const headers = { Authorization: "Bearer " + token };

  // Load all trips
  useEffect(() => {
    axios.get("http://localhost:5000/api/trips", { headers })
      .then(res => setTrips(res.data))
      .catch(err => setError(err.response?.data?.msg || "Failed to load trips"));
  }, [token]);

  // Load item summaries for each trip
  const loadSummaries = useCallback(async (tripList) => {
    const results = {};
    await Promise.all(
      tripList.map(async (trip) => {
        try {
          const res = await axios.get(
            "http://localhost:5000/api/trips/" + trip._id + "/summary",
            { headers }
          );
          results[trip._id] = res.data;
        } catch {
          results[trip._id] = { flights: 0, hotels: 0, activities: 0, total: 0 };
        }
      })
    );
    setSummaries(results);
  }, [token]);

  useEffect(() => {
    if (trips.length > 0) loadSummaries(trips);
  }, [trips, loadSummaries]);

  const createTrip = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Trip title is required");
    try {
      const res = await axios.post("http://localhost:5000/api/trips", form, { headers });
      const newTrips = [...trips, res.data];
      setTrips(newTrips);
      loadSummaries(newTrips);
      setForm({ title: "", destination: "", startDate: "", endDate: "" });
      setShowForm(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to create trip");
    }
  };

  const deleteTrip = async (id) => {
    if (!window.confirm("Delete this trip? This cannot be undone.")) return;
    try {
      await axios.delete("http://localhost:5000/api/trips/" + id, { headers });
      setTrips(trips.filter(t => t._id !== id));
      setSummaries(prev => { const s = { ...prev }; delete s[id]; return s; });
    } catch {
      setError("Failed to delete trip");
    }
  };

  // Filter by search
  const filteredTrips = trips.filter(trip =>
    trip.title.toLowerCase().includes(search.toLowerCase()) ||
    (trip.destination || "").toLowerCase().includes(search.toLowerCase())
  );

  // Group by status
  const ongoing   = filteredTrips.filter(t => getTripStatus(t.startDate, t.endDate).label === "Ongoing");
  const upcoming  = filteredTrips.filter(t => getTripStatus(t.startDate, t.endDate).label === "Upcoming");
  const noDate    = filteredTrips.filter(t => getTripStatus(t.startDate, t.endDate).label === "No Date");
  const completed = filteredTrips.filter(t => getTripStatus(t.startDate, t.endDate).label === "Completed");

  const renderTrips = (list) => list.map(trip => {
    const status  = getTripStatus(trip.startDate, trip.endDate);
    const daysMsg = getDaysMessage(trip.startDate, trip.endDate);
    return (
      <div key={trip._id} className="trip-card">
        <div className="trip-card-banner" />
        <div className="trip-card-body" onClick={() => navigate("/trip/" + trip._id)}>

          {/* Status Badge */}
          <div style={{ marginBottom: "10px" }}>
            <span style={{
              background: status.bg, color: status.color,
              padding: "4px 12px", borderRadius: "20px",
              fontSize: "12px", fontWeight: "700",
              border: "1px solid " + status.color + "33"
            }}>
              {status.label === "Upcoming"  && "🔵 "}
              {status.label === "Ongoing"   && "🟡 "}
              {status.label === "Completed" && "🟢 "}
              {status.label === "No Date"   && "⚪ "}
              {status.label}
            </span>
          </div>

          <h3>{trip.title}</h3>
          <p>📍 {trip.destination || "No destination set"}</p>
          <p>📅 {trip.startDate
            ? new Date(trip.startDate).toDateString()
            : "No date set"}
          </p>

          {/* Days countdown */}
          {daysMsg && (
            <p style={{
              marginTop: "6px", fontSize: "13px",
              fontWeight: "600", color: status.color
            }}>
              {daysMsg}
            </p>
          )}

          {/* ── Item Summary ── */}
          <ItemSummary summary={summaries[trip._id]} />

          <p style={{ marginTop: "8px", fontSize: "13px", color: "#888" }}>
            👥 {trip.collaborators?.length || 0} collaborator
            {trip.collaborators?.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button className="btn-delete" onClick={() => deleteTrip(trip._id)}>
          🗑️ Delete Trip
        </button>
      </div>
    );
  });

  const SectionHeader = ({ emoji, label, color, count }) => (
    <h3 style={{
      fontSize: "15px", fontWeight: "700",
      marginBottom: "16px", color,
      display: "flex", alignItems: "center", gap: "8px"
    }}>
      {emoji} {label}
      <span style={{
        background: color + "22", color,
        padding: "2px 10px", borderRadius: "20px",
        fontSize: "12px"
      }}>
        {count}
      </span>
    </h3>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🗺️ My Trips</h2>
        <button
          className="btn-primary"
          onClick={() => { setShowForm(!showForm); setError(""); }}
        >
          {showForm ? "✕ Cancel" : "+ New Trip"}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {/* Search Bar */}
      {trips.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <input
            placeholder="🔍 Search trips by title or destination..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: "white", border: "2px solid #e8e8e8" }}
          />
        </div>
      )}

      {/* New Trip Form */}
      {showForm && (
        <form className="trip-form" onSubmit={createTrip}>
          <input
            placeholder="Trip Title (e.g. Paris 2025)"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            placeholder="Destination (e.g. Paris, France)"
            value={form.destination}
            onChange={e => setForm({ ...form, destination: e.target.value })}
          />
          <input
            type="date"
            value={form.startDate}
            onChange={e => setForm({ ...form, startDate: e.target.value })}
          />
          <input
            type="date"
            value={form.endDate}
            onChange={e => setForm({ ...form, endDate: e.target.value })}
          />
          <button type="submit" className="btn-primary">
            🚀 Create Trip
          </button>
        </form>
      )}

      {/* Empty State */}
      {filteredTrips.length === 0 && (
        <div className="empty-state">
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>🌍</p>
          <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
            {search ? "No trips found" : "No trips yet"}
          </p>
          <p>
            {search
              ? `No trips matching "${search}"`
              : "Click \"+ New Trip\" to start planning!"}
          </p>
        </div>
      )}

      {/* Ongoing */}
      {ongoing.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <SectionHeader emoji="🟡" label="Ongoing" color="#f59e0b" count={ongoing.length} />
          <div className="trips-grid">{renderTrips(ongoing)}</div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <SectionHeader emoji="🔵" label="Upcoming" color="#4f46e5" count={upcoming.length} />
          <div className="trips-grid">{renderTrips(upcoming)}</div>
        </div>
      )}

      {/* No Date */}
      {noDate.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <SectionHeader emoji="⚪" label="No Date Set" color="#888" count={noDate.length} />
          <div className="trips-grid">{renderTrips(noDate)}</div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <SectionHeader emoji="🟢" label="Completed" color="#10b981" count={completed.length} />
          <div className="trips-grid">{renderTrips(completed)}</div>
        </div>
      )}
    </div>
  );
}