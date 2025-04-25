import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import { useAuth } from "../../contexts/AuthContext";
import {  Plus, Calendar, MapPin, Trash, Heart } from 'lucide-react';
import "./Dashboard.css";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { currentUser } = useAuth();


  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const q = query(collection(db, "itineraries"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const itineraryList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setItineraries(itineraryList);
      } catch (error) {
        toast.error("Error fetching itineraries",error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItineraries();
  }, [currentUser]);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this itinerary?")) {
      try {
        await deleteDoc(doc(db, "itineraries", id));
        setItineraries((prev) => prev.filter((i) => i.id !== id));
        toast.success("Itinerary deleted successfully!!");
      } catch (error) {
        toast.error("Counld not delete itinerary",error.message);
      }
    }
  };

  const toggleFavorite = async (id, isFavorite) => {
    try {
      const ref = doc(db, "itineraries", id);
      await updateDoc(ref, { isFavorite: !isFavorite });
      setItineraries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isFavorite: !isFavorite } : i))
      );
      toast.success(!isFavorite ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Could not update favorite status");
    }
  };

  const filtered = itineraries.filter((i) => {
    const search = searchTerm.toLowerCase();
    const matches =
      i.title.toLowerCase().includes(search) ||
      i.destination.toLowerCase().includes(search) ||
      i.activities?.some((a) => a.title.toLowerCase().includes(search));

    if (filterType === "all") return matches;
    if (filterType === "favorites") return matches && i.isFavorite;
    return matches && i.tripType === filterType;
  });

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Travel Itineraries</h1>
        <Link to="/create-itinerary" className="btn-create">
          <Plus /> Create New Itinerary
        </Link>
      </div>

      <div className="dashboard-filters">
        <div className="search-wrapper">
          Filter : 
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
          <option value="all">All Trips</option>
          <option value="favorites">Favorites</option>
          <option value="adventure">Adventure</option>
          <option value="leisure">Leisure</option>
          <option value="work">Work</option>
          <option value="family">Family</option>
          <option value="other">Other</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="dashboard-empty">No itineraries found. Create your first itinerary!</div>
      ) : (
        <div className="itinerary-grid">
          {filtered.map((i) => (
            <div key={i.id} className="itinerary-card">
              <div className="cover">
                {i.coverImage ? (
                  <img src={i.coverImage || "/placeholder.svg"} alt={i.destination} />
                ) : (
                  <div className="cover-placeholder">
                    <MapPin className="icon" />
                  </div>
                )}
                <button 
                  className={`favorite-btn ${i.isFavorite ? 'is-favorite' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(i.id, i.isFavorite);
                  }}
                  aria-label={i.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart fill={i.isFavorite ? "#ff4757" : "none"} stroke={i.isFavorite ? "#ff4757" : "currentColor"} />
                </button>
              </div>

              <div className="details">
                <div className="top">
                  <h2>{i.title}</h2>
                  <span className="badge">{i.tripType}</span>
                </div>
                <div className="meta">
                  <MapPin className="icon" />
                  <span>{i.destination}</span>
                </div>
                <div className="meta">
                  <Calendar className="icon" />
                  <span>
                    {new Date(i.startDate).toLocaleDateString()} - {new Date(i.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="activities1">
                  <p style={{width:"100%",textAlign:"start",fontSize:"1rem",fontWeight:"bolder",marginBottom:"0.3rem"}}>Activities:</p>
                  {i.activities?.slice(0, 2).map((a, idx) => (
                    <p key={idx} className="activities-data">{a.title}</p>
                  ))}
                  {i.activities?.length > 2 && <span>+{i.activities.length - 2} more</span>}
                </div>
                <div className="actions">
                  <Link to={`/itinerary/${i.id}`}>View</Link>
                  <button onClick={() => handleDelete(i.id)}>
                    <Trash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;