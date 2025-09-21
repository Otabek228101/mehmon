import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ReceiptDisplay from "../components/Receipt/ReceiptDisplay";
import ReceiptActions from "../components/Receipt/ReceiptActions";
import ReceiptPDF from "../components/Receipt/ReceiptPDF";
import { QRCodeSVG } from 'qrcode.react';
import { formatDate } from "../utils/receiptUtils";

function Receipt() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [qrData, setQrData] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/receipts/${id}`);
        console.log("Received data:", response.data);
        setData(response.data);
        
        const qrUrl = `${window.location.origin}/receipt/${id}?download=true`;
        setQrData(qrUrl);
        
        const urlParams = new URLSearchParams(window.location.search);
        const autoDownload = urlParams.get('download');
        if (autoDownload === 'true') {
          ReceiptPDF.downloadPDF(response.data, qrUrl);
        }
      } catch (err) {
        console.error("Error loading receipt:", err);
        setError(err.response?.data?.error || "Failed to load receipt");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleDownload = () => {
    if (data && qrData) {
      ReceiptPDF.downloadPDF(data, qrData);
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

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <button className="btn btn-primary" onClick={() => navigate("/history")}>
              Back to History
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Receipt not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <ReceiptDisplay data={data} formatDate={formatDate} />
          
          <hr style={{ borderTop: "1px dashed #ccc", margin: "20px 0" }} />
          
          <div className="row">
            <div className="col-md-6">
              <ReceiptActions 
                onDownload={handleDownload} 
                onBack={() => navigate("/history")} 
              />
            </div>
            <div className="col-md-6">
              <div className="text-center">
                <QRCodeSVG value={qrData} size={128} />
                <p className="text-muted small mt-2">Scan to download PDF</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Receipt;