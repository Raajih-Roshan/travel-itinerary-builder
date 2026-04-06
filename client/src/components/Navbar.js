import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
        ✈️ Travel Itinerary Builder
      </div>
      {user && (
        <div className="navbar-right">
          <div
            className="navbar-user"
            onClick={() => navigate("/profile")}
            style={{ cursor: "pointer" }}
            title="View Profile"
          >
            <div className="navbar-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {user.name}
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
