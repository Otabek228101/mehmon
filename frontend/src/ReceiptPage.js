import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import logo from "./logoBlack.png";
import { QRCodeSVG } from 'qrcode.react';
import axios from "axios";

function ReceiptPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [qrData, setQrData] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/receipts/${id}`);
        setData(response.data);
        setQrData(`${window.location.origin}/receipt/${id}?download=true`);
        const urlParams = new URLSearchParams(window.location.search);
        const autoDownload = urlParams.get('download');
        if (autoDownload === 'true') {
          downloadPDF(response.data);
        }
      } catch (error) {
        console.error("Error loading receipt:", error);
        navigate("/");
      }
    };
    loadData();
  }, [id, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const getValue = (obj, keys) => {
    for (const key of keys) {
      if (obj && obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }
    }
    return "";
  };

  const downloadPDF = (receiptData) => {
    if (!receiptData) return;
    const doc = new jsPDF();
    doc.addImage(logo, 'PNG', 10, 10, 50, 12);
    let y = 30;
    doc.setFontSize(16);
    doc.text(`Booking Number ${getValue(receiptData, ['receiptNumber', 'receipt_number'])}`, 140, y, { align: 'right' });
    y += 10;
    doc.setFontSize(12);
    doc.text("This is your receipt", 10, y);
    y += 15;
    doc.text("YOUR DETAILS", 10, y);
    y += 10;
    doc.text(`Name: ${getValue(receiptData, ['clientName', 'client_name'])}`, 10, y);
    y += 7;
    doc.text(`Email: ${getValue(receiptData, ['clientEmail', 'client_email'])}`, 10, y);
    y += 7;
    doc.text(`Phone: ${getValue(receiptData, ['clientPhone', 'client_phone'])}`, 10, y);
    y += 7;
    doc.text(`Date: ${formatDate(getValue(receiptData, ['receiptDate', 'receipt_date']))}`, 10, y);
    y += 15;
    doc.text("BOOKING DETAILS", 10, y);
    y += 10;
    doc.text(`Property name: ${getValue(receiptData, ['propertyName', 'property_name']) || "Multiple Properties"}`, 10, y);
    y += 7;
    doc.text(`Property address: ${getValue(receiptData, ['propertyAddress', 'property_address']) || "Various Locations"}`, 10, y);
    y += 7;
    doc.text(`Check-in: ${formatDate(getValue(receiptData, ['checkIn', 'check_in']))}`, 10, y);
    y += 7;
    doc.text(`Check-out: ${formatDate(getValue(receiptData, ['checkOut', 'check_out']))}`, 10, y);
    y += 7;
    doc.text(`Amount paid: €${parseFloat(getValue(receiptData, ['amountPaid', 'amount_paid']) || 0).toFixed(2)}`, 10, y);
    y += 15;
    if (receiptData.activities && receiptData.activities.length > 0) {
      doc.text("ACTIVITIES", 10, y);
      y += 10;
      receiptData.activities.forEach((activity, index) => {
        doc.text(`${activity.type} - Activity ${index + 1}`, 10, y);
        y += 7;
        if (getValue(activity, ['propertyName', 'property_name'])) {
          doc.text(`Property: ${getValue(activity, ['propertyName', 'property_name'])}`, 15, y);
          y += 7;
        }
        if (getValue(activity, ['propertyAddress', 'property_address'])) {
          doc.text(`Address: ${getValue(activity, ['propertyAddress', 'property_address'])}`, 15, y);
          y += 7;
        }
        if (getValue(activity, ['checkIn', 'check_in'])) {
          doc.text(`Check-in: ${formatDate(getValue(activity, ['checkIn', 'check_in']))}`, 15, y);
          y += 7;
        }
        if (getValue(activity, ['checkOut', 'check_out'])) {
          doc.text(`Check-out: ${formatDate(getValue(activity, ['checkOut', 'check_out']))}`, 15, y);
          y += 7;
        }
        if (getValue(activity, ['carModel', 'car_model'])) {
          doc.text(`Car Model: ${getValue(activity, ['carModel', 'car_model'])}`, 15, y);
          y += 7;
        }
        if (getValue(activity, ['carPlate', 'car_plate'])) {
          doc.text(`Car Plate: ${getValue(activity, ['carPlate', 'car_plate'])}`, 15, y);
          y += 7;
        }
        if (getValue(activity, ['pickupLocation', 'pickup_location'])) {
          doc.text(`Pickup: ${getValue(activity, ['pickupLocation', 'pickup_location'])}`, 15, y);
          y += 7;
        }
        if (getValue(activity, ['dropoffLocation', 'dropoff_location'])) {
          doc.text(`Dropoff: ${getValue(activity, ['dropoffLocation', 'dropoff_location'])}`, 15, y);
          y += 7;
        }
        if (getValue(activity, ['transferType', 'transfer_type'])) {
          doc.text(`Transfer Type: ${getValue(activity, ['transferType', 'transfer_type'])}`, 15, y);
          y += 7;
        }
        if (activity.description) {
          doc.text(`Description: ${activity.description}`, 15, y);
          y += 7;
        }
        doc.text(`Amount: €${parseFloat(activity.amount || 0).toFixed(2)}`, 15, y);
        y += 10;
      });
      doc.text(`Total Amount: €${parseFloat(getValue(receiptData, ['amountPaid', 'amount_paid']) || 0).toFixed(2)}`, 10, y);
      y += 15;
    }
    doc.setFontSize(10);
    doc.text("Your receipt is automatically generated. This is proof of your transaction – you can't use it to claim VAT.", 10, y, { maxWidth: 180 });
    y += 15;
    doc.text("Note: This isn't an invoice. A valid invoice for tax purposes can only be issued by the property.", 10, y, { maxWidth: 180 });
    doc.save(`receipt_${getValue(receiptData, ['receiptNumber', 'receipt_number'])}.pdf`);
  };

  if (!data) {
    return <div className="container mt-4">Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Receipt Details</h2>
      <div className="card shadow">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <img src={logo} alt="MEHMON Logo" style={{ width: "170px", height: "40px" }} />
            <h5 style={{ margin: "0" }}>Booking Number {getValue(data, ['receiptNumber', 'receipt_number'])}</h5>
          </div>
          <p className="text-muted mb-2">This is your receipt</p>
          
          <h6 className="mb-2">YOUR DETAILS</h6>
          <table className="table table-borderless">
            <tbody>
              <tr><td><strong>Name:</strong></td><td>{getValue(data, ['clientName', 'client_name'])}</td></tr>
              <tr><td><strong>Email:</strong></td><td>{getValue(data, ['clientEmail', 'client_email'])}</td></tr>
              <tr><td><strong>Phone:</strong></td><td>{getValue(data, ['clientPhone', 'client_phone'])}</td></tr>
              <tr><td><strong>Date:</strong></td><td>{formatDate(getValue(data, ['receiptDate', 'receipt_date']))}</td></tr>
            </tbody>
          </table>
          
          <h6 className="mb-2">BOOKING DETAILS</h6>
          <table className="table table-borderless">
            <tbody>
              <tr><td><strong>Property name:</strong></td><td>{getValue(data, ['propertyName', 'property_name']) || "Multiple Properties"}</td></tr>
              <tr><td><strong>Property address:</strong></td><td>{getValue(data, ['propertyAddress', 'property_address']) || "Various Locations"}</td></tr>
              <tr><td><strong>Check-in:</strong></td><td>{formatDate(getValue(data, ['checkIn', 'check_in']))}</td></tr>
              <tr><td><strong>Check-out:</strong></td><td>{formatDate(getValue(data, ['checkOut', 'check_out']))}</td></tr>
              <tr><td><strong>Amount paid:</strong></td><td>€{parseFloat(getValue(data, ['amountPaid', 'amount_paid']) || 0).toFixed(2)}</td></tr>
            </tbody>
          </table>

          {data?.activities?.length > 0 && (
            <>
              <h6 className="mb-2 mt-3">ACTIVITIES</h6>
              {data.activities.map((activity, index) => (
                <div key={index} className="card mb-2 border-light">
                  <div className="card-body p-3">
                    <h6 className="card-title mb-2 text-capitalize">{activity.type || 'Unknown'} - Activity {index + 1}</h6>
                    <div className="row">
                      {getValue(activity, ['propertyName', 'property_name']) && (
                        <div className="col-md-6 mb-2">
                          <div className="row">
                            <div className="col-5"><strong>Property:</strong></div>
                            <div className="col-7">{getValue(activity, ['propertyName', 'property_name'])}</div>
                          </div>
                        </div>
                      )}
                      {getValue(activity, ['propertyAddress', 'property_address']) && (
                        <div className="col-md-6 mb-2">
                          <div className="row">
                            <div className="col-5"><strong>Address:</strong></div>
                            <div className="col-7">{getValue(activity, ['propertyAddress', 'property_address'])}</div>
                          </div>
                        </div>
                      )}
                      {getValue(activity, ['checkIn', 'check_in']) && (
                        <div className="col-md-6 mb-2">
                          <div className="row">
                            <div className="col-5"><strong>Check-in:</strong></div>
                            <div className="col-7">{formatDate(getValue(activity, ['checkIn', 'check_in']))}</div>
                          </div>
                        </div>
                      )}
                      {getValue(activity, ['checkOut', 'check_out']) && (
                        <div className="col-md-6 mb-2">
                          <div className="row">
                            <div className="col-5"><strong>Check-out:</strong></div>
                            <div className="col-7">{formatDate(getValue(activity, ['checkOut', 'check_out']))}</div>
                          </div>
                        </div>
                      )}
                      {getValue(activity, ['carModel', 'car_model']) && (
                        <div className="col-md-6 mb-2">
                          <div className="row">
                            <div className="col-5"><strong>Car Model:</strong></div>
                            <div className="col-7">{getValue(activity, ['carModel', 'car_model'])}</div>
                          </div>
                        </div>
                      )}
                      {getValue(activity, ['carPlate', 'car_plate']) && (
                        <div className="col-md-6 mb-2">
                          <div className="row">
                            <div className="col-5"><strong>Car Plate:</strong></div>
                            <div className="col-7">{getValue(activity, ['carPlate', 'car_plate'])}</div>
                          </div>
                        </div>
                      )}
                      {getValue(activity, ['pickupLocation', 'pickup_location']) && (
                        <div className="col-md-6 mb-2">
                          <div className="row">
                            <div className="col-5"><strong>Pickup:</strong></div>
                            <div className="col-7">{getValue(activity, ['pickupLocation', 'pickup_location'])}</div>
                          </div>
                        </div>
                      )}
                      {getValue(activity, ['dropoffLocation', 'dropoff_location']) && (
                        <div className="col-md-6 mb-2">
                          <div className="row">
                            <div className="col-5"><strong>Dropoff:</strong></div>
                            <div className="col-7">{getValue(activity, ['dropoffLocation', 'dropoff_location'])}</div>
                          </div>
                        </div>
                      )}
                      {getValue(activity, ['transferType', 'transfer_type']) && (
                        <div className="col-md-6 mb-2">
                          <div className="row">
                            <div className="col-5"><strong>Transfer Type:</strong></div>
                            <div className="col-7">{getValue(activity, ['transferType', 'transfer_type'])}</div>
                          </div>
                        </div>
                      )}
                      {activity.description && (
                        <div className="col-12 mb-2">
                          <div className="row">
                            <div className="col-3"><strong>Description:</strong></div>
                            <div className="col-9">{activity.description}</div>
                          </div>
                        </div>
                      )}
                      <div className="col-md-6 mb-2">
                        <div className="row">
                          <div className="col-5"><strong style={{ color: "#28a745" }}>Amount:</strong></div>
                          <div className="col-7"><strong style={{ color: "#28a745" }}>€{parseFloat(activity.amount || 0).toFixed(2)}</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="card bg-light">
                <div className="card-body p-3">
                  <div className="row">
                    <div className="col-6"><strong>Total Amount:</strong></div>
                    <div className="col-6"><strong>€{parseFloat(getValue(data, ['amountPaid', 'amount_paid']) || 0).toFixed(2)}</strong></div>
                  </div>
                </div>
              </div>
            </>
          )}

          <hr style={{ borderTop: "1px dashed #ccc", margin: "20px 0" }} />
          <p className="text-muted small mb-3">
            Your receipt is automatically generated. This is proof of your transaction – you can't use it to claim VAT. 
            Note: This isn't an invoice. A valid invoice for tax purposes can only be issued by the property.
          </p>
          <button onClick={() => downloadPDF(data)} className="btn btn-success w-100 py-2" style={{ backgroundColor: "#28a745", border: "none", borderRadius: "5px", fontWeight: "500" }}>
            Download PDF
          </button>
          <button
            onClick={() => navigate("/history")}
            className="btn btn-secondary w-100 mt-2 py-2"
            style={{ backgroundColor: "#6c757d", border: "none", borderRadius: "5px", fontWeight: "500" }}
          >
            Back to History
          </button>
          <div className="mt-3 text-center">
            <QRCodeSVG value={qrData} size={128} />
            <p className="text-muted small mt-2">Scan to download PDF</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceiptPage;