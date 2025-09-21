function ReceiptActions({ onDownload, onBack }) {
  return (
    <div className="d-grid gap-2">
      <button 
        onClick={onDownload} 
        className="btn btn-success w-100 py-2" 
        style={{ borderRadius: "5px", fontWeight: "500" }}
      >
        Download PDF
      </button>
      {onBack && (
        <button 
          onClick={onBack} 
          className="btn btn-secondary w-100 py-2" 
          style={{ borderRadius: "5px", fontWeight: "500" }}
        >
          Back to History
        </button>
      )}
    </div>
  );
}

export default ReceiptActions;