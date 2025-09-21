import { formatDate } from "../../utils/receiptUtils";

function ClientForm({ form, errors, onChange }) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">Client Information</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Full Name <span className="text-danger">*</span></label>
            <input
              type="text"
              name="clientName"
              className={`form-control ${errors.clientName ? 'is-invalid' : ''}`}
              value={form.clientName}
              onChange={onChange}
              placeholder="Enter client name"
              required
            />
            {errors.clientName && <div className="invalid-feedback">{errors.clientName}</div>}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Email <span className="text-danger">*</span></label>
            <input
              type="email"
              name="clientEmail"
              className={`form-control ${errors.clientEmail ? 'is-invalid' : ''}`}
              value={form.clientEmail}
              onChange={onChange}
              placeholder="Enter client email"
              required
            />
            {errors.clientEmail && <div className="invalid-feedback">{errors.clientEmail}</div>}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Phone <span className="text-danger">*</span></label>
            <input
              type="tel"
              name="clientPhone"
              className={`form-control ${errors.clientPhone ? 'is-invalid' : ''}`}
              value={form.clientPhone}
              onChange={onChange}
              placeholder="+1 (555) 123-4567"
              required
            />
            {errors.clientPhone && <div className="invalid-feedback">{errors.clientPhone}</div>}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Receipt Date <span className="text-danger">*</span></label>
            <input
              type="date"
              name="receiptDate"
              className={`form-control ${errors.receiptDate ? 'is-invalid' : ''}`}
              value={form.receiptDate}
              onChange={onChange}
              max={today}
              required
            />
            {errors.receiptDate && <div className="invalid-feedback">{errors.receiptDate}</div>}
            {form.receiptDate && (
              <div className="form-text">
                {formatDate(form.receiptDate)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientForm;