import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const getStrength = (p) => {
    if (p.length === 0) return { label: "", color: "#eee", width: "0%" };
    if (p.length < 4) return { label: "Weak", color: "#e53e3e", width: "33%" };
    if (p.length < 8) return { label: "Medium", color: "#f59e0b", width: "66%" };
    return { label: "Strong", color: "#10b981", width: "100%" };
  };
  const strength = getStrength(form.password);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Name must be at least 2 characters");
    if (!form.email.includes("@")) return setError("Please enter a valid email");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">🌍</div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Start planning your trips today</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="input-label">Full Name</label>
          <input name="name" placeholder="Your full name" onChange={handleChange} required />
          <label className="input-label">Email Address</label>
          <input name="email" type="email" placeholder="you@example.com" onChange={handleChange} required />
          <label className="input-label">Password</label>
          <input name="password" type="password" placeholder="Min 6 characters" onChange={handleChange} required />
          {form.password.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <div style={{ height: "4px", background: "#eee", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: strength.width, background: strength.color, transition: "all 0.3s", borderRadius: "4px" }} />
              </div>
              <p style={{ fontSize: "12px", color: strength.color, marginTop: "4px", fontWeight: "600" }}>{strength.label} password</p>
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/">Login here</Link></p>
      </div>
    </div>
  );
}
