import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TripDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ type: "flight", title: "", date: "", time: "", location: "", notes: "" });

  useEffect(() => {
    const headers = { Authorization: "Bearer " + token };
    axios.get("http://localhost:5000/api/trips/" + id, { headers }).then(res => setTrip(res.data));
    axios.get("http://localhost:5000/api/items/" + id, { headers }).then(res => setItems(res.data));
  }, [id, token]);

  const addItem = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/items", { ...form, trip: id }, {
        headers: { Authorization: "Bearer " + token }
      });
      setItems([...items, res.data]);
      setForm({ type: "flight", title: "", date: "", time: "", location: "", notes: "" });
    } catch (err) {
      setError(err.response?.data?.msg);
    }
  };

  const deleteItem = async (itemId) => {
    await axios.delete("http://localhost:5000/api/items/" + itemId, {
      headers: { Authorization: "Bearer " + token }
    });
    setItems(items.filter(i => i._id !== itemId));
  };

  const icons = { flight: "Flight", hotel: "Hotel", activity: "Activity" };
  const colors = { flight: "item-flight", hotel: "item-hotel", activity: "item-activity" };

  return (
    <div className="trip-detail">
      <button className="btn-back" onClick={() => navigate("/dashboard")}>Back to Trips</button>
      {trip && <div className="trip-detail-header"><h2>{trip.title}</h2><p>{trip.destination}</p></div>}
      {error && <div className="error-msg">{error}</div>}
      <div className="add-item-card">
        <h3>Add to Timeline</h3>
        <form className="add-item-form" onSubmit={addItem}>
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="flight">Flight</option>
            <option value="hotel">Hotel</option>
            <option value="activity">Activity</option>
          </select>
          <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
          <input placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          <input placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          <button type="submit" className="btn-primary">Add Item</button>
        </form>
      </div>
      <div className="timeline">
        <h3>Timeline</h3>
        {items.length === 0 ? (
          <div className="empty-state"><p>No items yet. Add a flight, hotel or activity!</p></div>
        ) : (
          items.map(item => (
            <div key={item._id} className={"timeline-item " + colors[item.type]}>
              <div className="item-icon">{icons[item.type]}</div>
              <div className="item-body">
                <strong>{item.title}</strong>
                <p>{item.location || "No location"}</p>
                <p>{item.date ? new Date(item.date).toDateString() : "No date"} {item.time && "at " + item.time}</p>
                {item.notes && <p>{item.notes}</p>}
                <small>Added by {item.addedBy?.name || "Unknown"}</small>
              </div>
              <button className="btn-delete" onClick={() => deleteItem(item._id)}>X</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
