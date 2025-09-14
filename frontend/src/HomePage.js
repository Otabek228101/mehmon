import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReceiptPreview from "./ReceiptPreview";
import axios from "axios";

function HomePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    receiptNumber: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    receiptDate: "",
    activities: [{ 
      type: "hotel", 
      propertyName: "", 
      propertyAddress: "", 
      checkIn: "", 
      checkOut: "", 
      amount: "", 
      carModel: "", 
      carPlate: "", 
      pickupLocation: "", 
      dropoffLocation: "", 
      transferType: "", 
      description: "" 
    }],
  });
  const [errors, setErrors] = useState({});
  const [generated, setGenerated] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [carRentals, setCarRentals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/hotels`)
      .then((res) => setHotels(res.data))
      .catch(err => console.error("Error loading hotels:", err));
    
    axios.get(`${process.env.REACT_APP_API_URL}/api/car-rentals`)
      .then((res) => setCarRentals(res.data))
      .catch(err => console.error("Error loading car rentals:", err));
  }, []);

  const handleChange = (e, index) => {
    if (index !== undefined) {
      const newActivities = [...form.activities];
      newActivities[index][e.target.name] = e.target.value;
      setForm({ ...form, activities: newActivities });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleHotelSelect = (e, index) => {
    const selectedHotel = hotels.find(hotel => hotel.name === e.target.value);
    const newActivities = [...form.activities];
    newActivities[index].propertyName = e.target.value;
    newActivities[index].propertyAddress = selectedHotel ? selectedHotel.address : "";
    setForm({ ...form, activities: newActivities });
  };

  const handleCarRentalSelect = (e, index) => {
    const selectedRental = carRentals.find(rental => rental.name === e.target.value);
    const newActivities = [...form.activities];
    newActivities[index].propertyName = e.target.value;
    newActivities[index].propertyAddress = selectedRental ? selectedRental.address : "";
    setForm({ ...form, activities: newActivities });
  };

  const addActivity = () => {
    setForm({
      ...form,
      activities: [...form.activities, { 
        type: "hotel", 
        propertyName: "", 
        propertyAddress: "", 
        checkIn: "", 
        checkOut: "", 
        amount: "", 
        carModel: "", 
        carPlate: "", 
        pickupLocation: "", 
        dropoffLocation: "", 
        transferType: "", 
        description: "" 
      }],
    });
  };

  const removeActivity = (index) => {
    const newActivities = form.activities.filter((_, i) => i !== index);
    setForm({ ...form, activities: newActivities });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.clientName.trim()) newErrors.clientName = "This field is required";
    if (!form.clientEmail.trim()) newErrors.clientEmail = "This field is required";
    if (!form.clientPhone.trim()) newErrors.clientPhone = "This field is required";
    if (!form.receiptDate.trim()) newErrors.receiptDate = "This field is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.clientEmail && !emailRegex.test(form.clientEmail)) {
      newErrors.clientEmail = "Please enter a valid email address";
    }
    
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (form.clientPhone && !phoneRegex.test(form.clientPhone)) {
      newErrors.clientPhone = "Please enter a valid phone number";
    }
    
    form.activities.forEach((activity, index) => {
      const amount = parseFloat(activity.amount);
      if (!activity.amount || isNaN(amount) || amount <= 0) {
        newErrors[`activityAmount${index}`] = "Amount must be a positive number";
      }
      
      if (amount > 1000000) {
        newErrors[`activityAmount${index}`] = "Amount is too large";
      }
      
      if (activity.checkIn && activity.checkOut && new Date(activity.checkIn) > new Date(activity.checkOut)) {
        newErrors[`activityCheckOut${index}`] = "Check-out date must be after check-in date";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const totalAmount = form.activities.reduce((sum, activity) => {
        const amount = parseFloat(activity.amount) || 0;
        return sum + amount;
      }, 0);
      
      const firstActivity = form.activities[0];
      const receiptData = {
        receiptNumber: "",
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientPhone: form.clientPhone,
        receiptDate: new Date(form.receiptDate).toISOString(),
        propertyName: firstActivity.propertyName || "Multiple Properties",
        propertyAddress: firstActivity.propertyAddress || "Various Locations",
        checkIn: firstActivity.checkIn ? new Date(firstActivity.checkIn).toISOString() : null,
        checkOut: firstActivity.checkOut ? new Date(firstActivity.checkOut).toISOString() : null,
        activities: form.activities.map(activity => ({
          type: activity.type,
          propertyName: activity.propertyName,
          propertyAddress: activity.propertyAddress,
          checkIn: activity.checkIn ? new Date(activity.checkIn).toISOString() : null,
          checkOut: activity.checkOut ? new Date(activity.checkOut).toISOString() : null,
          amount: parseFloat(activity.amount) || 0,
          carModel: activity.carModel,
          carPlate: activity.carPlate,
          pickupLocation: activity.pickupLocation,
          dropoffLocation: activity.dropoffLocation,
          transferType: activity.transferType,
          description: activity.description
        })),
        amountPaid: totalAmount,
      };
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/receipts`, receiptData);
      const savedData = response.data;
      setGenerated(savedData);
      localStorage.setItem("receiptData", JSON.stringify(savedData));
      setLoading(false);
    } catch (error) {
      console.error("Error generating receipt:", error);
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Create Receipt</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate("/history")}
        >
          History
        </button>
      </div>
      
      <div className="row">
        {/* Форма всегда занимает всю ширину, если нет сгенерированного чека, и половину - если есть */}
        <div className={generated ? "col-lg-6" : "col-12"}>
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title mb-4">Receipt Details</h5>
              <div className="mb-3">
                <label className="form-label">Client Name</label>
                <input
                  type="text"
                  name="clientName"
                  className={`form-control ${errors.clientName ? "is-invalid" : ""}`}
                  value={form.clientName}
                  onChange={(e) => handleChange(e)}
                />
                {errors.clientName && <div className="invalid-feedback">{errors.clientName}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Client Email</label>
                <input
                  type="email"
                  name="clientEmail"
                  className={`form-control ${errors.clientEmail ? "is-invalid" : ""}`}
                  value={form.clientEmail}
                  onChange={(e) => handleChange(e)}
                />
                {errors.clientEmail && <div className="invalid-feedback">{errors.clientEmail}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Client Phone</label>
                <input
                  type="text"
                  name="clientPhone"
                  className={`form-control ${errors.clientPhone ? "is-invalid" : ""}`}
                  value={form.clientPhone}
                  onChange={(e) => handleChange(e)}
                />
                {errors.clientPhone && <div className="invalid-feedback">{errors.clientPhone}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Receipt Date</label>
                <input
                  type="date"
                  name="receiptDate"
                  className={`form-control ${errors.receiptDate ? "is-invalid" : ""}`}
                  value={form.receiptDate}
                  onChange={(e) => handleChange(e)}
                />
                {errors.receiptDate && <div className="invalid-feedback">{errors.receiptDate}</div>}
              </div>

              <h5 className="mt-4 mb-3">Activities</h5>
              {form.activities.map((activity, index) => (
                <div key={index} className="card mb-3 border-light">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">Activity {index + 1}</h6>
                      {form.activities.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeActivity(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Activity Type</label>
                      <select
                        name="type"
                        className="form-control"
                        value={activity.type}
                        onChange={(e) => handleChange(e, index)}
                      >
                        <option value="hotel">Hotel</option>
                        <option value="car_rental">Car Rental</option>
                        <option value="transfer">Transfer</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    {activity.type === "hotel" && (
                      <>
                        <div className="mb-3">
                          <label className="form-label">Hotel</label>
                          <select
                            name="propertyName"
                            className="form-control"
                            value={activity.propertyName}
                            onChange={(e) => handleHotelSelect(e, index)}
                          >
                            <option value="">Select a hotel</option>
                            {hotels.map((hotel) => (
                              <option key={hotel.id} value={hotel.name}>{hotel.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Property Address</label>
                          <input
                            type="text"
                            name="propertyAddress"
                            className="form-control"
                            value={activity.propertyAddress}
                            onChange={(e) => handleChange(e, index)}
                          />
                        </div>
                      </>
                    )}
                    {activity.type === "car_rental" && (
                      <>
                        <div className="mb-3">
                          <label className="form-label">Car Rental</label>
                          <select
                            name="propertyName"
                            className="form-control"
                            value={activity.propertyName}
                            onChange={(e) => handleCarRentalSelect(e, index)}
                          >
                            <option value="">Select a car rental</option>
                            {carRentals.map((rental) => (
                              <option key={rental.id} value={rental.name}>{rental.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Property Address</label>
                          <input
                            type="text"
                            name="propertyAddress"
                            className="form-control"
                            value={activity.propertyAddress}
                            onChange={(e) => handleChange(e, index)}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Car Model</label>
                          <input
                            type="text"
                            name="carModel"
                            className="form-control"
                            value={activity.carModel}
                            onChange={(e) => handleChange(e, index)}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Car Plate</label>
                          <input
                            type="text"
                            name="carPlate"
                            className="form-control"
                            value={activity.carPlate}
                            onChange={(e) => handleChange(e, index)}
                          />
                        </div>
                      </>
                    )}
                    {activity.type === "transfer" && (
                      <>
                        <div className="mb-3">
                          <label className="form-label">Transfer Type</label>
                          <input
                            type="text"
                            name="transferType"
                            className="form-control"
                            value={activity.transferType}
                            onChange={(e) => handleChange(e, index)}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Pickup Location</label>
                          <input
                            type="text"
                            name="pickupLocation"
                            className="form-control"
                            value={activity.pickupLocation}
                            onChange={(e) => handleChange(e, index)}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Dropoff Location</label>
                          <input
                            type="text"
                            name="dropoffLocation"
                            className="form-control"
                            value={activity.dropoffLocation}
                            onChange={(e) => handleChange(e, index)}
                          />
                        </div>
                      </>
                    )}
                    {activity.type === "other" && (
                      <>
                        <div className="mb-3">
                          <label className="form-label">Property Name</label>
                          <input
                            type="text"
                            name="propertyName"
                            className="form-control"
                            value={activity.propertyName}
                            onChange={(e) => handleChange(e, index)}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Property Address</label>
                          <input
                            type="text"
                            name="propertyAddress"
                            className="form-control"
                            value={activity.propertyAddress}
                            onChange={(e) => handleChange(e, index)}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <input
                            type="text"
                            name="description"
                            className="form-control"
                            value={activity.description}
                            onChange={(e) => handleChange(e, index)}
                          />
                        </div>
                      </>
                    )}
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Check-In</label>
                        <input
                          type="date"
                          name="checkIn"
                          className="form-control"
                          value={activity.checkIn}
                          onChange={(e) => handleChange(e, index)}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Check-Out</label>
                        <input
                          type="date"
                          name="checkOut"
                          className="form-control"
                          value={activity.checkOut}
                          onChange={(e) => handleChange(e, index)}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Amount (€)</label>
                      <input
                        type="number"
                        name="amount"
                        className={`form-control ${errors[`activityAmount${index}`] ? "is-invalid" : ""}`}
                        value={activity.amount}
                        onChange={(e) => handleChange(e, index)}
                        min="0"
                        max="1000000"
                        step="0.01"
                      />
                      {errors[`activityAmount${index}`] && <div className="invalid-feedback">{errors[`activityAmount${index}`]}</div>}
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary mb-3" onClick={addActivity}>
                + Add Activity
              </button>
              <button 
                type="button" 
                onClick={handleGenerate} 
                className="btn btn-primary w-100 mb-2"
                disabled={loading}
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
              {generated && (
                <button type="button" onClick={() => setGenerated(null)} className="btn btn-secondary w-100 mb-2">
                  Reset Form
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Предпросмотр чека - отображается только после генерации */}
        {generated && (
          <div className="col-lg-6">
            <ReceiptPreview data={generated} onClick={() => navigate(`/receipt/${generated.id}`)} />
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;