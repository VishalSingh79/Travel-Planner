import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import { useAuth } from "../../contexts/AuthContext";
import { Calendar, MapPin, Tag, ArrowLeft } from "lucide-react";
import "./ItineraryDetails.css";
import { toast } from "react-toastify";

const ItineraryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const docRef = doc(db, "itineraries", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.userId !== currentUser.uid) {
            toast.error("Access Denied");
            return navigate("/");
          }
          setItinerary({ id: docSnap.id, ...data });
        } else {
          toast.error("Itinerary not found");
          navigate("/");
        }
      } catch {
        toast.error("Failed to fetch itinerary");
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [id, currentUser, navigate]);

  const toggleFavorite = async () => {
    try {
      const ref = doc(db, "itineraries", id);
      await updateDoc(ref, { isFavorite: !itinerary.isFavorite });
      setItinerary({ ...itinerary, isFavorite: !itinerary.isFavorite });
      toast.success(`Itinerary ${!itinerary.isFavorite ? "added to" : "removed from"} favorites`);
    } catch(error) {
      toast.error("Could not update favorite status");
    }
  };

  if (loading) return <div className="itinerary-loading">Loading...</div>;
  if (!itinerary) return null;

  return (
    <div className="itinerary-container">
      <div className="itinerary-back">
        <Link to="/" className="itinerary-link">
          <ArrowLeft className="icon" /> Back to Itineraries
        </Link>
      </div>

      <div className="itinerary-card">
        <div className="itinerary-cover">
          {itinerary.coverImage ? (
            <img src={itinerary.coverImage} alt={itinerary.destination} />
          ) : (
            <div className="cover-placeholder">
              <MapPin className="icon" />
            </div>
          )}
          <div className="overlay" />
          <div className="itinerary-header">
            <h1>{itinerary.title}</h1>
          </div>
        </div>

        <div className="itinerary-content">
          <div className="itinerary-info">
            <div className="info-item">
              <MapPin className="icon teal" />
              <span>{itinerary.destination}</span>
            </div>
            <div className="info-item">
              <Calendar className="icon teal" />
              <span>
                {new Date(itinerary.startDate).toLocaleDateString()} -{" "}
                {new Date(itinerary.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="info-item">
              <Tag className="icon teal" />
              <span className="trip-type">{itinerary.tripType}</span>
            </div>
          </div>

          {itinerary.description && (
            <div className="section">
              <h2>Description</h2>
              <p>{itinerary.description}</p>
            </div>
          )}

          <div className="section">
            <h2>Activities</h2>
            {itinerary.activities?.length ? (
              <div className="activities">
                {itinerary.activities.map((a, i) => (
                  <div key={i} className="activity-card">
                    <h3>{a.title || "Untitled Activity"}</h3>
                    {a.date && (
                      <div className="info-item">
                        <Calendar className="icon" />
                        <span>{new Date(a.date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {a.location && (
                      <div className="info-item">
                        <MapPin className="icon" />
                        <span>{a.location}</span>
                      </div>
                    )}
                    {a.notes && <p>{a.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-activities">
                <p>No activities added yet.</p>
                <Link to={`/edit-itinerary/${itinerary.id}`} className="itinerary-link">
                  Add activities
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDetails;
