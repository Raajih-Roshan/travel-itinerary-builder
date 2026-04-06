import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { token, user, login } = useAuth();
  const navigate = useNavigate();
  const headers = { Authorization: "Bearer " + token };

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: ""
  });
  const [profileMsg, setProfileMsg]   = useState("");
  const [profileErr, setProfileErr]   = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [stats, setStats]     = useState({ trips: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/auth/profile", { headers })
      .then(res => setProfile({ name: res.data.name, email: res.data.email }))
      .catch(() => {});

    axios.get("http://localhost:5000/api/trips", { headers })
      .then(res => setStats({ trips: res.data.length }))
      .catch(() => {});
  }, [token]);

  const updateProfile = async (e) => {
    e.preventDefault();
    setProfileErr("");
    setProfileMsg("");
    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/profile",
        profile,
        { headers }
      );
      login({ ...user, name: res.data.name, email: res.data.email }, token);
      setProfileMsg("Profile updated successfully!");
    } catch (err) {
      setProfileErr(err.response?.data?.msg || "Update failed");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordErr("");
    setPasswordMsg("");
    if (passwords.newPassword.length < 6) {
      return setPasswordErr("New password must be at least 6 characters");
    }
    setLoading(true);
    try {
      await axios.put(
        "http://localhost:5000/api/auth/change-password",
        passwords,
        { headers }
      );
      setPasswordMsg("Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordErr(err.response?.data?.msg || "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">

      <div className="profile-header">
        <button className="btn-back" onClick={() => navigate("/dashboard")}>
          Back to Trips
        </button>
        <div className="profile-avatar-large">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-number">{stats.trips}</span>
          <span className="stat-label">Trips Created</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{new Date().getFullYear()}</span>
          <span className="stat-label">Member Since</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">✈️</span>
          <span className="stat-label">Travel Planner</span>
        </div>
      </div>

      <div className="profile-card">
        <h3>Edit Profile</h3>
        {profileMsg && <div className="success-msg">{profileMsg}</div>}
        {profileErr && <div className="error-msg">{profileErr}</div>}
        <form onSubmit={updateProfile}>
          <label className="input-label">Full Name</label>
          <input
            value={profile.name}
            onChange={e => setProfile({ ...profile, name: e.target.value })}
            placeholder="Your full name"
            required
          />
          <label className="input-label">Email Address</label>
          <input
            type="email"
            value={profile.email}
            onChange={e => setProfile({ ...profile, email: e.target.value })}
            placeholder="your@email.com"
            required
          />
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </form>
      </div>

      <div className="profile-card">
        <h3>Change Password</h3>
        {passwordMsg && <div className="success-msg">{passwordMsg}</div>}
        {passwordErr && <div className="error-msg">{passwordErr}</div>}
        <form onSubmit={changePassword}>
          <label className="input-label">Current Password</label>
          <input
            type="password"
            value={passwords.currentPassword}
            onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
            placeholder="Enter current password"
            required
          />
          <label className="input-label">New Password</label>
          <input
            type="password"
            value={passwords.newPassword}
            onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
            placeholder="Min 6 characters"
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

    </div>
  );
}