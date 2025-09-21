import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function References() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [carRentals, setCarRentals] = useState([]);
  const [newHotel, setNewHotel] = useState({ name: "", address: "", city: "" });
  const [newCarRental, setNewCarRental] = useState({ name: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hotelsRes, rentalsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/hotels`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/car-rentals`)
      ]);
      setHotels(hotelsRes.data);
      setCarRentals(rentalsRes.data);
      setError(null);
    } catch (err) {
      console.error("Error loading references:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddHotel = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/hotels`, newHotel);
      setNewHotel({ name: "", address: "", city: "" });
      fetchData();
    } catch (err) {
      console.error("Error adding hotel:", err);
      setError("Failed to add hotel");
    }
  };

  const handleAddCarRental = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/car-rentals`, newCarRental);
      setNewCarRental({ name: "", address: "" });
      fetchData();
    } catch (err) {
      console.error("Error adding car rental:", err);
      setError("Failed to add car rental");
    }
  };

  const handleDeleteHotel = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/hotels/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting hotel:", err);
      setError("Failed to delete hotel");
    }
  };

  const handleDeleteCarRental = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/car-rentals/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting car rental:", err);
      setError("Failed to delete car rental");
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage References</h2>
        <button 
          className="btn btn-outline-primary"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Hotels</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddHotel}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newHotel.name}
                    onChange={(e) => setNewHotel({...newHotel, name: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newHotel.address}
                    onChange={(e) => setNewHotel({...newHotel, address: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newHotel.city}
                    onChange={(e) => setNewHotel({...newHotel, city: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">Add Hotel</button>
              </form>
            </div>
          </div>

          <div className="list-group">
            {hotels.map(hotel => (
              <div key={hotel.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{hotel.name}</strong> - {hotel.address}, {hotel.city}
                </div>
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeleteHotel(hotel.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default References;