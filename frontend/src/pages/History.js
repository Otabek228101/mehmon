import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReceiptTable from "../components/Receipt/ReceiptTable";
import { getValue } from "../utils/receiptUtils";

function History() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchReceipts(1);
  }, []);

  const fetchReceipts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/receipts?page=${page}&limit=${pagination.limit}`
      );
      
      let receipts = response.data.data || response.data;
      
      receipts = receipts.sort((a, b) => {
        const numA = parseInt(getValue(a, ['receiptNumber', 'receipt_number']).replace('M', ''));
        const numB = parseInt(getValue(b, ['receiptNumber', 'receipt_number']).replace('M', ''));
        return numA - numB;
      });
      
      setReceipts(receipts);
      setFilteredReceipts(receipts);
      setPagination({
        page: response.data.page || page,
        limit: response.data.limit || pagination.limit,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1
      });
    } catch (error) {
      console.error("Error fetching receipts:", error);
      setReceipts([]);
      setFilteredReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim()) {
      fetchReceipts(page);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/receipts/search?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=${pagination.limit}`
      );
      
      let searchResults = response.data.data || response.data;
      
      searchResults = searchResults.sort((a, b) => {
        const numA = parseInt(getValue(a, ['receiptNumber', 'receipt_number']).replace('M', ''));
        const numB = parseInt(getValue(b, ['receiptNumber', 'receipt_number']).replace('M', ''));
        return numA - numB;
      });
      
      setFilteredReceipts(searchResults);
      setPagination({
        page: response.data.page || page,
        limit: response.data.limit || pagination.limit,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1
      });
    } catch (error) {
      console.error("Error searching receipts:", error);
      setFilteredReceipts([]);
      setPagination({ ...pagination, total: 0, totalPages: 0 });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredReceipts(receipts);
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (page) => {
    if (searchQuery.trim()) {
      handleSearch(page);
    } else {
      fetchReceipts(page);
    }
  };

  const viewReceipt = (receipt) => {
    navigate(`/receipt/${receipt.id}`);
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
        <h1>Receipt History</h1>
        <button 
          className="btn btn-outline-primary"
          onClick={() => navigate("/")}
        >
          Create New Receipt
        </button>
      </div>

      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by client name, email, or receipt number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <button
                className="btn btn-primary w-100"
                onClick={() => handlePageChange(1)}
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    Search
                  </>
                )}
              </button>
            </div>
            <div className="col-md-3">
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary w-100"
                  type="button"
                  onClick={handleClearSearch}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Clear
                </button>
              )}
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
            {searchQuery && (
              <button className="btn btn-outline-secondary mt-3" onClick={handleClearSearch}>
                Show All Receipts
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="card shadow mb-3">
            <div className="card-body p-0">
              <ReceiptTable 
                receipts={filteredReceipts} 
                onView={viewReceipt} 
              />
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <li 
                    key={i + 1} 
                    className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}
                  >
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default History;