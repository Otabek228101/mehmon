import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddReferencePage() {
  const navigate = useNavigate();
  const [hotelForm, setHotelForm] = useState({ name: "", address: "", city: "" });
  const [carRentalForm, setCarRentalForm] = useState({ name: "", address: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleHotelChange = (e) => {
    setHotelForm({ ...hotelForm, [e.target.name]: e.target.value });
  };

  const handleCarRentalChange = (e) => {
    setCarRentalForm({ ...carRentalForm, [e.target.name]: e.target.value });
  };

  const addHotel = async () => {
    if (!hotelForm.name || !hotelForm.address) {
      setError("Name and Address are required for Hotel");
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/hotels`, hotelForm);
      setSuccess("Hotel added successfully");
      setHotelForm({ name: "", address: "", city: "" });
      setError("");
    } catch (err) {
      setError("Failed to add hotel: " + err.response?.data?.error || err.message);
    }
  };

  const addCarRental = async () => {
    if (!carRentalForm.name || !carRentalForm.address) {
      setError("Name and Address are required for Car Rental");
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/car-rentals`, carRentalForm);
      setSuccess("Car Rental added successfully");
      setCarRentalForm({ name: "", address: "" });
      setError("");
    } catch (err) {
      setError("Failed to add car rental: " + err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage References</h2>
        <button className="btn btn-secondary" onClick={() => navigate("/history")}>
          Back to History
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row">
        {/* Section for Adding Hotel */}
        <div className="col-md-6">
          <div className="card shadow mb-4">
            <div className="card-body">
              <h4>Add New Hotel</h4>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={hotelForm.name}
                  onChange={handleHotelChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  value={hotelForm.address}
                  onChange={handleHotelChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">City (optional)</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={hotelForm.city}
                  onChange={handleHotelChange}
                />
              </div>
              <button className="btn btn-primary w-100" onClick={addHotel}>
                Add Hotel
              </button>
            </div>
          </div>
        </div>

        {/* Section for Adding Car Rental */}
        <div className="col-md-6">
          <div className="card shadow mb-4">
            <div className="card-body">
              <h4>Add New Car Rental</h4>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={carRentalForm.name}
                  onChange={handleCarRentalChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  value={carRentalForm.address}
                  onChange={handleCarRentalChange}
                />
              </div>
              <button className="btn btn-primary w-100" onClick={addCarRental}>
                Add Car Rental
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddReferencePage;
