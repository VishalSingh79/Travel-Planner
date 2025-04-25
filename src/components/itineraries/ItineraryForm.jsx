import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { X, Plus, Upload } from 'lucide-react';
import cloudinaryConfig from "../../cloudinary-config";
import "./ItineraryForm.css";

const ItineraryForm = () => {
  const { id } = useParams();   
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    tripType: "leisure",
    description: "",
    activities: [{ title: "", date: "", location: "", notes: "" }],
    isFavorite: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleActivityChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...formData.activities];
    updated[index][name] = value;
    setFormData((prev) => ({ ...prev, activities: updated }));
  };

  const addActivity = () => {
    setFormData((prev) => ({
      ...prev,
      activities: [...prev.activities, { title: "", date: "", location: "", notes: "" }],
    }));
  };

  const removeActivity = (index) => {
    if (formData.activities.length === 1) {
      return toast.error("At least one activity is required");
    }
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  const openCloudinaryWidget = () => {
    if (!window.cloudinary) {
      toast.error("Cloudinary not loaded");
      return;
    }

    window.cloudinary.openUploadWidget(
      {
        cloudName: cloudinaryConfig.cloud_name,
        uploadPreset: cloudinaryConfig.upload_preset,
        sources: ['local', 'camera'],
        showAdvancedOptions: false,
        cropping: true,
        multiple: false,
        defaultSource: 'local',
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#90A0B3",
            tabIcon: "#0078FF",
            menuIcons: "#5A616A",
            textDark: "#000000",
            textLight: "#FFFFFF",
            link: "#0078FF",
            action: "#FF620C",
            inactiveTabIcon: "#0E2F5A",
            error: "#F44235",
            inProgress: "#0078FF",
            complete: "#20B832",
            sourceBg: "#E4EBF1"
          },
          fonts: {
            default: null,
            "'Poppins', sans-serif": {
              url: "https://fonts.googleapis.com/css?family=Poppins",
              active: true
            }
          }
        }
      },
      (error, result) => {
        if (error) {
          toast.error(error.message || "Failed to upload image");
          return;
        }
        
        if (result && result.event === "success") {
          setCoverImagePreview(result.info.secure_url);
          setCoverImageFile(result.info.secure_url);
          toast.success("Image uploaded successfully");
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.destination || !formData.startDate || !formData.endDate) {
      return toast.error("All fields are required");
    }

    try {
      setLoading(true);

      const itineraryData = {
        ...formData,
        coverImage: coverImageFile || formData.coverImage || "",
        userId: currentUser.uid,
        updatedAt: serverTimestamp(),
      };
        await addDoc(collection(db, "itineraries"), itineraryData);
        toast.success("Itinerary created successfully!!");
      
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create itinerary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="itinerary-form-container">
      <h1>Create New Itinerary</h1>
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <div>
            <label className="input-label">Title *</label>
            <input name="title" className="input-field" value={formData.title} onChange={handleChange} required />
          </div>
          <div>
            <label className="input-label">Destination *</label>
            <input name="destination" className="input-field" value={formData.destination} onChange={handleChange} required />
          </div>
          <div>
            <label className="input-label">Start Date *</label>
            <input type="date" name="startDate" className="input-field" value={formData.startDate} onChange={handleChange} required />
          </div>
          <div>
            <label className="input-label">End Date *</label>
            <input type="date" name="endDate" className="input-field" value={formData.endDate} onChange={handleChange} required />
          </div>
          <div>
            <label className="input-label">Trip Type</label>
            <select name="tripType" className="select-field" value={formData.tripType} onChange={handleChange}>
              <option value="adventure">Adventure</option>
              <option value="leisure">Leisure</option>
              <option value="work">Work</option>
              <option value="family">Family</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="input-label">Cover Image</label>
            <button 
              type="button" 
              onClick={openCloudinaryWidget}
              className="button button-primary"
            >
              <Upload className="icon" /> Upload Cover Image
            </button>
            {coverImagePreview && (
              <div className="image-upload-preview">
                <img src={coverImagePreview || "/placeholder.svg"} alt="Preview" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="input-label">Description</label>
          <textarea name="description" rows="4" className="textarea-field" value={formData.description} onChange={handleChange} />
        </div>

        <div className="activity-header">
          <h2>Activities</h2>
          <button type="button" className="button button-primary" onClick={addActivity}><Plus className="icon" /> Add Activity</button>
        </div>

        {formData.activities.map((activity, i) => (
          <div key={i} className="activity-section">
            <div className="activity-fields">
              <input placeholder="Title" name="title" value={activity.title} onChange={(e) => handleActivityChange(i, e)} className="input-field" />
              <input type="date" name="date" value={activity.date} onChange={(e) => handleActivityChange(i, e)} className="input-field" />
              <input placeholder="Location" name="location" value={activity.location} onChange={(e) => handleActivityChange(i, e)} className="input-field" />
              <input placeholder="Notes" name="notes" value={activity.notes} onChange={(e) => handleActivityChange(i, e)} className="input-field" />
            </div>
            <button type="button" onClick={() => removeActivity(i)} className="button button-secondary"><X className="icon" /> Remove</button>
          </div>
        ))}

        <div className="button-group">
          <button type="button" onClick={() => navigate("/")} className="button button-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="button button-primary">
            {loading ? "Saving..." : "Create Itinerary"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItineraryForm;