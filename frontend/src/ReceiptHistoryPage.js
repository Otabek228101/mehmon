import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ReceiptHistoryPage() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredReceipts, setFilteredReceipts] = useState([]);

  useEffect(() => {
    fetchReceipts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      searchReceipts();
    } else {
      setFilteredReceipts(receipts);
    }
  }, [searchQuery, receipts]);

  const fetchReceipts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/receipts`);
      setReceipts(response.data);
      setFilteredReceipts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      setLoading(false);
    }
  };

  const searchReceipts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/receipts/search?q=${searchQuery}`);
      setFilteredReceipts(response.data);
    } catch (error) {
      console.error("Error searching receipts:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const viewReceipt = (receipt) => {
    navigate(`/receipt/${receipt.id}`);
  };

  const getValue = (obj, keys) => {
    for (const key of keys) {
      if (obj && obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }
    }
    return "";
  };

  if (loading) {
    return <div className="container mt-4">Loading receipts...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Receipt History</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate("/")}
        >
          Create New Receipt
        </button>
      </div>

      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by receipt number, client name, email or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={searchReceipts}
                >
                  Search
                </button>
              </div>
            </div>
            <div className="col-md-6 text-end">
              <span className="text-muted">
                Showing {filteredReceipts.length} of {receipts.length} receipts
              </span>
            </div>
          </div>
        </div>
      </div>

      {filteredReceipts.length === 0 ? (
        <div className="card shadow">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">
              {searchQuery ? "No receipts found matching your search" : "No receipts found"}
            </h5>
          </div>
        </div>
      ) : (
        <div className="card shadow">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Receipt Number</th>
                    <th>Client</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Activities</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceipts.map((receipt) => (
                    <tr key={receipt.id}>
                      <td>
                        <strong>{getValue(receipt, ['receiptNumber', 'receipt_number'])}</strong>
                      </td>
                      <td>{getValue(receipt, ['clientName', 'client_name'])}</td>
                      <td>{getValue(receipt, ['clientEmail', 'client_email'])}</td>
                      <td>{getValue(receipt, ['clientPhone', 'client_phone'])}</td>
                      <td>{formatDate(getValue(receipt, ['receiptDate', 'receipt_date']))}</td>
                      <td>${parseFloat(getValue(receipt, ['amountPaid', 'amount_paid']) || 0).toFixed(2)}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {receipt.activities ? receipt.activities.length : 0} activities
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => viewReceipt(receipt)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceiptHistoryPage;