import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Travel Itinerary Builder</div>
      {user && (
        <div className="navbar-right">
          <span>{user.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      )}
    </nav>
  );
}
