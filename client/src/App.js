import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider }   from "./context/AuthContext";
import { ThemeProvider }  from "./context/ThemeContext";
import { SocketProvider } from "./context/SocketContext";
import Navbar        from "./components/Navbar";
import PrivateRoute  from "./components/PrivateRoute";
import Login         from "./pages/Login";
import Register      from "./pages/Register";
import Dashboard     from "./pages/Dashboard";
import TripDetail    from "./pages/TripDetail";
import Profile       from "./pages/Profile";
import "./index.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/"          element={<Login />} />
              <Route path="/register"  element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/trip/:id"  element={<PrivateRoute><TripDetail /></PrivateRoute>} />
              <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;