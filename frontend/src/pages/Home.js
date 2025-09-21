import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ClientForm from "../components/Form/ClientForm";
import ActivityForm from "../components/Form/ActivityForm";
import ReceiptPreview from "../components/Receipt/ReceiptPreview";
import { validateForm } from "../utils/receiptUtils";

function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    receiptDate: "",
    amountPaid: 0,
    activities: [{ 
      type: "hotel", 
      propertyName: "", 
      propertyAddress: "", 
      checkIn: "", 
      checkOut: "", 
      amount: "", 
      pickupLocation: "", 
      dropoffLocation: "", 
      transferType: "", 
      description: "" 
    }],
  });
  const [errors, setErrors] = useState({});
  const [generated, setGenerated] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const hotelsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/hotels`);
        setHotels(hotelsRes.data);
      } catch (err) {
        console.error("Error loading references:", err);
      }
    };

    fetchReferences();
  }, []);

  useEffect(() => {
    const total = form.activities.reduce((sum, activity) => {
      return sum + (parseFloat(activity.amount) || 0);
    }, 0);
    setForm(prev => ({ ...prev, amountPaid: total }));
  }, [form.activities]);

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleActivityChange = (index, e) => {
    const { name, value } = e.target;
    const newActivities = [...form.activities];
    newActivities[index][name] = value;
    setForm({ ...form, activities: newActivities });
    
    const errorKey = `activity${name}${index}`;
    if (errors[errorKey]) {
      setErrors({ ...errors, [errorKey]: "" });
    }
  };

  const handleTypeChange = (index, type) => {
    const newActivities = [...form.activities];
    newActivities[index].type = type;
    
    newActivities[index].propertyName = "";
    newActivities[index].propertyAddress = "";
    newActivities[index].pickupLocation = "";
    newActivities[index].dropoffLocation = "";
    newActivities[index].transferType = "";
    newActivities[index].description = "";
    
    setForm({ ...form, activities: newActivities });
  };

  const handleHotelSelect = (index, hotelName) => {
    const newActivities = [...form.activities];
    const selectedHotel = hotels.find(h => h.name === hotelName);
    newActivities[index].propertyName = selectedHotel ? selectedHotel.name : "";
    newActivities[index].propertyAddress = selectedHotel ? selectedHotel.address : "";
    setForm({ ...form, activities: newActivities });
  };

  const addActivity = () => {
    setForm({
      ...form,
      activities: [
        ...form.activities,
        { 
          type: "hotel", 
          propertyName: "", 
          propertyAddress: "", 
          checkIn: "", 
          checkOut: "", 
          amount: "", 
          pickupLocation: "", 
          dropoffLocation: "", 
          transferType: "", 
          description: "" 
        }
      ]
    });
  };

  const removeActivity = (index) => {
    if (form.activities.length > 1) {
      const newActivities = form.activities.filter((_, i) => i !== index);
      setForm({ ...form, activities: newActivities });
    }
  };

  const handleGenerate = async () => {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const requestData = {
      ...form,
      amountPaid: parseFloat(form.amountPaid) || 0,
      activities: form.activities.map(activity => ({
        ...activity,
        amount: parseFloat(activity.amount) || 0,
        checkIn: activity.checkIn || null,
        checkOut: activity.checkOut || null
      }))
    };

    try {
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/receipts`, requestData);
      setGenerated(response.data);
      setErrors({});
    } catch (err) {
      console.error("Error generating receipt:", err);
      setErrors({ general: err.response?.data?.error || "Failed to generate receipt" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      receiptDate: "",
      amountPaid: 0,
      activities: [{ 
        type: "hotel", 
        propertyName: "", 
        propertyAddress: "", 
        checkIn: "", 
        checkOut: "", 
        amount: "", 
        pickupLocation: "", 
        dropoffLocation: "", 
        transferType: "", 
        description: "" 
      }],
    });
    setErrors({});
    setGenerated(null);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Create Receipt</h1>
        <div>
          <button 
            className="btn btn-outline-primary me-2"
            onClick={() => navigate("/references")}
          >
            Manage References
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={() => navigate("/history")}
          >
            View History
          </button>
        </div>
      </div>

      <div className="row">
        <div className={generated ? "col-lg-8" : "col-12"}>
          <ClientForm 
            form={form} 
            errors={errors} 
            onChange={handleClientChange} 
          />
          
          {form.activities.map((activity, index) => (
            <ActivityForm 
              key={index} 
              index={index} 
              activity={activity} 
              errors={errors} 
              hotels={hotels} 
              onChange={handleActivityChange}
              onTypeChange={handleTypeChange}
              onHotelSelect={handleHotelSelect} 
              onRemove={() => removeActivity(index)} 
            />
          ))}
          
          <div className="mb-3">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={addActivity}
            >
              + Add Activity
            </button>
          </div>

          {form.amountPaid > 0 && (
            <div className="alert alert-info">
              <strong>Total Amount:</strong> ${form.amountPaid.toFixed(2)}
            </div>
          )}

          {errors.general && (
            <div className="alert alert-danger">{errors.general}</div>
          )}

          <div className="d-grid gap-2">
            <button 
              type="button" 
              onClick={handleGenerate} 
              className="btn btn-primary"
              disabled={loading || form.activities.length === 0}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Generating...
                </>
              ) : (
                "Generate Receipt"
              )}
            </button>
            
            {(generated || Object.keys(errors).length > 0) && (
              <button 
                type="button" 
                onClick={handleReset} 
                className="btn btn-secondary"
              >
                Reset Form
              </button>
            )}
          </div>
        </div>
        
        {generated && (
          <div className="col-lg-4">
            <ReceiptPreview 
              data={generated} 
              onClick={() => navigate(`/receipt/${generated.id}`)} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;