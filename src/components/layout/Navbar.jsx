import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Menu, X, User, LogOut, Map } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Map className="icon" /> TravelPlanner
        </Link>

        <div className="navbar-desktop">
          {currentUser ? (
            <>
              <Link to="/create-itinerary" className="navbar-link">
                Create Itinerary
              </Link>
              <button className="navbar-link" onClick={handleLogout}>
                <LogOut className="icon-sm" /> Logout
              </button>
              <div className="navbar-user">
                <User className="icon-sm" />
                <span>{currentUser.displayName || currentUser.email}</span>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-link">
                Register
              </Link>
            </>
          )}
        </div>

        <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="icon" /> : <Menu className="icon" />}
        </button>
      </div>

      {isOpen && (
        <div className="navbar-mobile">
          {currentUser ? (
            <>
              <Link to="/create-itinerary" className="navbar-link" onClick={() => setIsOpen(false)}>
                Create Itinerary
              </Link>
              <button className="navbar-link" onClick={() => { handleLogout(); setIsOpen(false); }}>
                Logout
              </button>
              <div className="navbar-user">Signed in as: {currentUser.displayName || currentUser.email}</div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={() => setIsOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="navbar-link" onClick={() => setIsOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
