import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import ItineraryForm from "./components/itineraries/ItineraryForm";
import ItineraryDetails from "./components/itineraries/ItineraryDetails";
import Navbar from "./components/layout/Navbar";
import "./App.css";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loader-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-itinerary"
                element={
                  <ProtectedRoute>
                    <ItineraryForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-itinerary/:id"
                element={
                  <ProtectedRoute>
                    <ItineraryForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/itinerary/:id"
                element={
                  <ProtectedRoute>
                    <ItineraryDetails />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;