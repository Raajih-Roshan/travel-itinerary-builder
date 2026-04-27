import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { token, user, login, logout, updateAvatar } = useAuth();
  const { darkMode, toggleDarkMode }         = useTheme();
  const navigate                             = useNavigate();
  const fileInputRef                         = useRef(null);
  const headers = { Authorization: "Bearer " + token };

  const [profile, setProfile]         = useState({ name: "", email: "" });
  const [passwords, setPasswords]     = useState({ currentPassword: "", newPassword: "" });
  const [profileMsg, setProfileMsg]   = useState("");
  const [profileErr, setProfileErr]   = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [avatarMsg, setAvatarMsg]     = useState("");
  const [avatarErr, setAvatarErr]     = useState("");
  const [stats, setStats]             = useState({ trips: 0 });
  const [loading, setLoading]         = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput]             = useState("");
  const [deleteErr, setDeleteErr]                 = useState("");
  const [deleting, setDeleting]                   = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/auth/profile", { headers })
      .then(res => setProfile({ name: res.data.name, email: res.data.email }))
      .catch(() => {});

    axios.get("http://localhost:5000/api/trips", { headers })
      .then(res => setStats({ trips: res.data.length }))
      .catch(() => {});
  }, [token]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    setAvatarLoading(true);
    setAvatarErr("");
    setAvatarMsg("");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/avatar",
        formData,
        { headers: { ...headers, "Content-Type": "multipart/form-data" } }
      );
      updateAvatar(res.data.avatar);
      setAvatarMsg("✅ Profile photo updated!");
      setAvatarPreview(res.data.avatar);
    } catch (err) {
      setAvatarErr(err.response?.data?.msg || "Avatar upload failed");
      setAvatarPreview(user?.avatar || null);
    } finally {
      setAvatarLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setProfileErr(""); setProfileMsg("");
    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/profile", profile, { headers }
      );
      login({ ...user, name: res.data.name, email: res.data.email }, token);
      setProfileMsg("Profile updated successfully!");
    } catch (err) {
      setProfileErr(err.response?.data?.msg || "Update failed");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordErr(""); setPasswordMsg("");
    if (passwords.newPassword.length < 6)
      return setPasswordErr("New password must be at least 6 characters");
    setLoading(true);
    try {
      await axios.put(
        "http://localhost:5000/api/auth/change-password", passwords, { headers }
      );
      setPasswordMsg("Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordErr(err.response?.data?.msg || "Password change failed");
    } finally {
      setLoading(false);
    }
  };
  const deleteAccount = async () => {
    if (deleteInput !== "DELETE") {
      return setDeleteErr('Please type DELETE to confirm');
    }
    setDeleting(true);
    setDeleteErr("");
    try {
      await axios.delete(
        "http://localhost:5000/api/auth/account",
        { headers }
      );
      logout();
      navigate("/");
    } catch (err) {
      setDeleteErr(err.response?.data?.msg || "Failed to delete account");
      setDeleting(false);
    }
  };

  return (
    <div className="profile-page">

      {/* ── Back Button top left ── */}
      <button className="btn-back" onClick={() => navigate("/dashboard")}>
        ← Back to Trips
      </button>

      {/* ── Profile Header ── */}
      <div className="profile-header">

        {/* Avatar with camera button */}
        <div style={{
          position: "relative",
          display: "inline-block",
          marginBottom: "16px"
        }}>
          {avatarPreview || user?.avatar ? (
            <img
              src={avatarPreview || user?.avatar}
              alt="avatar"
              style={{
                width: "90px", height: "90px",
                borderRadius: "50%", objectFit: "cover",
                border: "4px solid #4f46e5",
                boxShadow: "0 8px 24px rgba(79,70,229,0.4)"
              }}
            />
          ) : (
            <div className="profile-avatar-large">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Camera icon button */}
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={avatarLoading}
            title="Change profile photo"
            style={{
              position: "absolute", bottom: "0", right: "0",
              width: "28px", height: "28px",
              background: "#4f46e5", color: "white",
              border: "2px solid white", borderRadius: "50%",
              cursor: "pointer", fontSize: "12px",
              display: "flex", alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
            }}
          >
            {avatarLoading ? "⏳" : "📷"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Avatar messages */}
        {avatarMsg && (
          <p style={{
            color: "#10b981", fontSize: "13px",
            fontWeight: "600", marginBottom: "8px"
          }}>
            {avatarMsg}
          </p>
        )}
        {avatarErr && (
          <p style={{
            color: "#e53e3e", fontSize: "13px",
            marginBottom: "8px"
          }}>
            {avatarErr}
          </p>
        )}

        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
      </div>

      {/* ── Stats ── */}
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

      {/* ── Appearance / Dark Mode ── */}
      <div className="profile-card">
        <h3>🌙 Appearance</h3>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginTop: "14px"
        }}>
          <div>
            <p style={{ fontWeight: "600", fontSize: "14px" }}>
              {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </p>
            <p style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
              {darkMode ? "Switch to light theme" : "Switch to dark theme"}
            </p>
          </div>
          {/* Toggle Switch */}
          <div
            onClick={toggleDarkMode}
            style={{
              width: "52px", height: "28px",
              background: darkMode ? "#4f46e5" : "#e0e0e0",
              borderRadius: "14px", cursor: "pointer",
              position: "relative", transition: "background 0.3s",
              flexShrink: 0
            }}
          >
            <div style={{
              position: "absolute",
              top: "3px",
              left: darkMode ? "27px" : "3px",
              width: "22px", height: "22px",
              background: "white", borderRadius: "50%",
              transition: "left 0.3s",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}/>
          </div>
        </div>
      </div>

      {/* ── Edit Profile ── */}
      <div className="profile-card">
        <h3>✏️ Edit Profile</h3>
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

      {/* ── Change Password ── */}
      <div className="profile-card">
        <h3>🔒 Change Password</h3>
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
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
      {/* ── Delete Account ── */}
<div className="profile-card" style={{
  border: "1.5px solid #fed7d7"
}}>
  <h3 style={{ color: "#e53e3e" }}>⚠️ Danger Zone</h3>

  {!showDeleteConfirm ? (
    <div style={{ marginTop: "14px" }}>
      <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>
        Permanently delete your account and all your trips, items and memories.
        This action <strong>cannot be undone.</strong>
      </p>
      <button
        onClick={() => setShowDeleteConfirm(true)}
        style={{
          background: "transparent",
          border: "1.5px solid #e53e3e",
          color: "#e53e3e",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "14px",
          transition: "all 0.2s",
          width: "100%"
        }}
        onMouseEnter={e => {
          e.target.style.background = "#e53e3e";
          e.target.style.color = "white";
        }}
        onMouseLeave={e => {
          e.target.style.background = "transparent";
          e.target.style.color = "#e53e3e";
        }}
      >
        🗑️ Delete My Account
      </button>
    </div>
  ) : (
    <div style={{ marginTop: "14px" }}>
      <div style={{
        background: "#fff5f5", border: "1px solid #fed7d7",
        borderRadius: "10px", padding: "14px", marginBottom: "16px"
      }}>
        <p style={{ fontSize: "13px", color: "#e53e3e", fontWeight: "600", marginBottom: "8px" }}>
          ⚠️ This will permanently delete:
        </p>
        <p style={{ fontSize: "13px", color: "#888", margin: "4px 0" }}>
          🗺️ All your trips
        </p>
        <p style={{ fontSize: "13px", color: "#888", margin: "4px 0" }}>
          📅 All timeline items
        </p>
        <p style={{ fontSize: "13px", color: "#888", margin: "4px 0" }}>
          📸 All memories and photos
        </p>
        <p style={{ fontSize: "13px", color: "#888", margin: "4px 0" }}>
          👤 Your account permanently
        </p>
      </div>

      <label className="input-label" style={{ color: "#e53e3e" }}>
        Type <strong>DELETE</strong> to confirm
      </label>
      <input
        placeholder="Type DELETE here"
        value={deleteInput}
        onChange={e => setDeleteInput(e.target.value)}
        style={{
          borderColor: deleteInput === "DELETE" ? "#e53e3e" : "#e8e8e8",
          marginBottom: "10px"
        }}
      />

      {deleteErr && (
        <div className="error-msg" style={{ marginBottom: "10px" }}>
          {deleteErr}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => {
            setShowDeleteConfirm(false);
            setDeleteInput("");
            setDeleteErr("");
          }}
          style={{
            flex: 1, padding: "11px",
            background: "transparent",
            border: "1.5px solid #ddd",
            borderRadius: "8px", cursor: "pointer",
            fontWeight: "600", fontSize: "14px"
          }}
        >
          Cancel
        </button>
        <button
          onClick={deleteAccount}
          disabled={deleting || deleteInput !== "DELETE"}
          style={{
            flex: 1, padding: "11px",
            background: deleteInput === "DELETE" ? "#e53e3e" : "#f0f0f0",
            color: deleteInput === "DELETE" ? "white" : "#aaa",
            border: "none", borderRadius: "8px",
            cursor: deleteInput === "DELETE" ? "pointer" : "not-allowed",
            fontWeight: "700", fontSize: "14px",
            transition: "all 0.2s"
          }}
        >
          {deleting ? "Deleting..." : "🗑️ Delete Forever"}
        </button>
      </div>
    </div>
  )}
</div>
    </div>
  );
}