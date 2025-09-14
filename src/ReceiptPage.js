import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import logo from "./logoBlack.png"; 

function ReceiptPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("receiptData");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); 
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.addImage(logo, 'PNG', 20, 15, 30, 30);
    
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text("Booking Receipt", 105, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Receipt #${data.receiptNumber}`, 105, 35, { align: 'center' });
    
    doc.line(20, 45, 190, 45);
    
    let yPosition = 60;
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("YOUR DETAILS", 20, yPosition);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    yPosition += 10;
    doc.text(`Name: ${data.clientName}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Email: ${data.clientEmail}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Date: ${formatDate(data.receiptDate)}`, 20, yPosition);
    
    yPosition += 15;
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("BOOKING DETAILS", 20, yPosition);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    yPosition += 10;
    doc.text(`Property name: ${data.propertyName}`, 20, yPosition);
    yPosition += 8;
    
    const addressLines = doc.splitTextToSize(`Property address: ${data.propertyAddress}`, 170);
    doc.text(addressLines, 20, yPosition);
    yPosition += 8 * addressLines.length;
    
    doc.text(`Check-in: ${formatDate(data.checkIn)}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Check-out: ${formatDate(data.checkOut)}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Amount paid: €${parseFloat(data.amountPaid).toFixed(2)}`, 20, yPosition);
    yPosition += 8;
    doc.text(`City Tax: €${parseFloat(data.cityTax).toFixed(2)}`, 20, yPosition);
    
    yPosition += 15;
    
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
 
    doc.setFontSize(10);
    const noteText = [
      "Your receipt is automatically generated.",
      "This is proof of your transaction – you can't use it to claim VAT.",
      "",
      "Note: This isn't an invoice.",
      "A valid invoice for tax purposes can only be issued by the property."
    ];
    
    noteText.forEach(line => {
      doc.text(line, 20, yPosition);
      yPosition += 5;
    });
    
    doc.save("receipt.pdf");
  };

  if (!data) return <div className="container mt-3">No receipt found</div>;

  return (
    <div className="container mt-3">
      <div className="card shadow p-4" style={{ borderRadius: "10px", border: "1px solid #eee", backgroundColor: "#fff" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <img src={logo} alt="Logo" style={{ width: "200px", height: "50px" }} />
          <h4 style={{ margin: "0", color: "#333", fontWeight: "600" }}>Booking Receipt #{data.receiptNumber}</h4>
        </div>
        <p className="text-muted mb-3">This is your official receipt</p>
        <div className="row">
          <div className="col-md-6">
            <h6 className="mb-2" style={{ color: "#555", fontWeight: "500" }}>YOUR DETAILS</h6>
            <table className="table table-borderless">
              <tbody>
                <tr><td style={{ width: "120px", fontWeight: "bold", color: "#444" }}>Name:</td><td>{data.clientName}</td></tr>
                <tr><td style={{ width: "120px", fontWeight: "bold", color: "#444" }}>Email:</td><td>{data.clientEmail}</td></tr>
                <tr><td style={{ width: "120px", fontWeight: "bold", color: "#444" }}>Date:</td><td>{formatDate(data.receiptDate)}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="col-md-6">
            <h6 className="mb-2" style={{ color: "#555", fontWeight: "500" }}>BOOKING DETAILS</h6>
            <table className="table table-borderless">
              <tbody>
                <tr><td style={{ width: "120px", fontWeight: "bold", color: "#444" }}>Property name:</td><td>{data.propertyName}</td></tr>
                <tr><td style={{ width: "120px", fontWeight: "bold", color: "#444" }}>Address:</td><td>{data.propertyAddress}</td></tr>
                <tr><td style={{ width: "120px", fontWeight: "bold", color: "#444" }}>Check-in:</td><td>{formatDate(data.checkIn)}</td></tr>
                <tr><td style={{ width: "120px", fontWeight: "bold", color: "#444" }}>Check-out:</td><td>{formatDate(data.checkOut)}</td></tr>
                <tr><td style={{ width: "120px", fontWeight: "bold", color: "#444" }}>Amount paid:</td><td>€{parseFloat(data.amountPaid).toFixed(2)}</td></tr>
                <tr><td style={{ width: "120px", fontWeight: "bold", color: "#444" }}>City Tax:</td><td>€{parseFloat(data.cityTax).toFixed(2)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <hr style={{ borderTop: "1px dashed #ccc", margin: "20px 0" }} />
        <p className="text-muted small mb-3">
          Your receipt is automatically generated. This is proof of your transaction – you can't use it to claim VAT. 
          Note: This isn't an invoice. A valid invoice for tax purposes can only be issued by the property.
        </p>
        <button onClick={downloadPDF} className="btn btn-success w-100 py-2" style={{ backgroundColor: "#28a745", border: "none", borderRadius: "5px", fontWeight: "500" }}>
          Download PDF
        </button>
        <button
          onClick={() => navigate("/")}
          className="btn btn-secondary w-100 mt-2 py-2"
          style={{ backgroundColor: "#6c757d", border: "none", borderRadius: "5px", fontWeight: "500" }}
        >
          Back to Form
        </button>
      </div>
    </div>
  );
}

export default ReceiptPage;