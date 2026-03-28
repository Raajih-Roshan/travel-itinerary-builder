import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState({ title: "", destination: "", startDate: "", endDate: "" });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/trips", {
      headers: { Authorization: "Bearer " + token }
    }).then(res => setTrips(res.data)).catch(err => setError(err.response?.data?.msg));
  }, [token]);

  const createTrip = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/trips", form, {
        headers: { Authorization: "Bearer " + token }
      });
      setTrips([...trips, res.data]);
      setForm({ title: "", destination: "", startDate: "", endDate: "" });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.msg);
    }
  };

  const deleteTrip = async (id) => {
    if (!window.confirm("Delete this trip?")) return;
    await axios.delete("http://localhost:5000/api/trips/" + id, {
      headers: { Authorization: "Bearer " + token }
    });
    setTrips(trips.filter(t => t._id !== id));
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>My Trips</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Trip"}
        </button>
      </div>
      {error && <div className="error-msg">{error}</div>}
      {showForm && (
        <form className="trip-form" onSubmit={createTrip}>
          <input placeholder="Trip Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <input placeholder="Destination" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} />
          <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
          <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
          <button type="submit" className="btn-primary">Create Trip</button>
        </form>
      )}
      {trips.length === 0 ? (
        <div className="empty-state"><p>No trips yet. Create your first trip!</p></div>
      ) : (
        <div className="trips-grid">
          {trips.map(trip => (
            <div key={trip._id} className="trip-card">
              <div className="trip-card-body" onClick={() => navigate("/trip/" + trip._id)}>
                <h3>{trip.title}</h3>
                <p>{trip.destination || "No destination"}</p>
                <p>{trip.startDate ? new Date(trip.startDate).toDateString() : "No date"}</p>
                <p>{trip.collaborators?.length || 0} collaborators</p>
              </div>
              <button className="btn-delete" onClick={() => deleteTrip(trip._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
