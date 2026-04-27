import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout }          = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate                  = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav className="navbar">
      <div
        className="navbar-brand"
        onClick={() => navigate("/dashboard")}
        style={{ cursor: "pointer" }}
      >
        ✈️ Travel Itinerary Builder
      </div>

      <div className="navbar-right">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="dark-toggle"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {user && (
          <>
            <div
              className="navbar-user"
              onClick={() => navigate("/profile")}
              style={{ cursor: "pointer" }}
              title="View Profile"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  style={{
                    width: "28px", height: "28px",
                    borderRadius: "50%", objectFit: "cover",
                    marginRight: "6px", border: "2px solid #a78bfa"
                  }}
                />
              ) : (
                <div className="navbar-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              {user.name}
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}