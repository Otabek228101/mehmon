import { formatDate, getValue } from "../../utils/receiptUtils";

function ReceiptTable({ receipts, onView }) {
  return (
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
          {receipts.map((receipt) => (
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
                  onClick={() => onView(receipt)}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReceiptTable;