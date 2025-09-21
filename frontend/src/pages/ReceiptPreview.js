import logo from "../assets/logoBlack.png";
import { QRCodeSVG } from 'qrcode.react';
import ReceiptDisplay from "../components/Receipt/ReceiptDisplay";
import ReceiptActions from "../components/Receipt/ReceiptActions";
import ReceiptPDF from "../components/Receipt/ReceiptPDF";
import { formatDate } from "../utils/receiptUtils";

function ReceiptPreview({ data, onClick }) {
  const qrData = `${window.location.origin}/receipt/${data.id}?download=true`;

  const handleDownload = (e) => {
    e.stopPropagation();
    ReceiptPDF.downloadPDF(data, qrData);
  };

  const handleView = (e) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <div className="card shadow" onClick={handleView}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Receipt Preview</h5>
          <button 
            className="btn btn-sm btn-outline-primary" 
            onClick={handleView}
          >
            View Full Receipt
          </button>
        </div>

        <ReceiptDisplay 
          data={data} 
          formatDate={formatDate} 
          isPreview={true} 
        />

        <hr />

        <div className="d-grid gap-2">
          <button 
            className="btn btn-success" 
            onClick={handleDownload}
          >
            Download PDF
          </button>
        </div>

        <div className="mt-3 text-center">
          <QRCodeSVG value={qrData} size={100} />
          <p className="text-muted small mt-2">Scan to download</p>
        </div>
      </div>
    </div>
  );
}

export default ReceiptPreview;