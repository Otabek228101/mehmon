import { formatDate } from "../../utils/receiptUtils";

function ActivityForm({ 
  index, 
  activity, 
  errors, 
  hotels, 
  onChange, 
  onTypeChange, 
  onHotelSelect, 
  onRemove 
}) {
  const getError = (field) => errors[`activity${field}${index}`];

  const renderHotelFields = () => (
    <>
      <div className="mb-3">
        <label className="form-label">Select Hotel <span className="text-danger">*</span></label>
        <select
          className={`form-select ${getError('PropertyName') ? 'is-invalid' : ''}`}
          value={activity.propertyName}
          onChange={(e) => onHotelSelect(index, e.target.value)}
          required
        >
          <option value="">Choose a hotel...</option>
          {hotels.map(hotel => (
            <option key={hotel.id} value={hotel.name}>
              {hotel.name} - {hotel.city}
            </option>
          ))}
        </select>
        {getError('PropertyName') && (
          <div className="invalid-feedback">{getError('PropertyName')}</div>
        )}
      </div>

      {activity.propertyName && (
        <div className="mb-3">
          <label className="form-label">Property Address</label>
          <input
            type="text"
            name="propertyAddress"
            className="form-control"
            value={activity.propertyAddress}
            onChange={(e) => onChange(index, e)}
            readOnly
          />
        </div>
      )}
    </>
  );

  const renderCarRentalFields = () => (
    <>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Pickup Location <span className="text-danger">*</span></label>
          <input
            type="text"
            name="pickupLocation"
            className={`form-control ${getError('PickupLocation') ? 'is-invalid' : ''}`}
            value={activity.pickupLocation}
            onChange={(e) => onChange(index, e)}
            placeholder="Enter pickup location"
            required
          />
          {getError('PickupLocation') && (
            <div className="invalid-feedback">{getError('PickupLocation')}</div>
          )}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Dropoff Location <span className="text-danger">*</span></label>
          <input
            type="text"
            name="dropoffLocation"
            className={`form-control ${getError('DropoffLocation') ? 'is-invalid' : ''}`}
            value={activity.dropoffLocation}
            onChange={(e) => onChange(index, e)}
            placeholder="Enter dropoff location"
            required
          />
          {getError('DropoffLocation') && (
            <div className="invalid-feedback">{getError('DropoffLocation')}</div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Operator Comments <span className="text-danger">*</span></label>
        <textarea
          name="description"
          className={`form-control ${getError('Description') ? 'is-invalid' : ''}`}
          rows="4"
          value={activity.description}
          onChange={(e) => onChange(index, e)}
          placeholder="Enter all rental details, pickup/dropoff information, special instructions, and any other relevant comments for the operator..."
          required
        />
        {getError('Description') && (
          <div className="invalid-feedback">{getError('Description')}</div>
        )}
      </div>
    </>
  );

  const renderTransferFields = () => (
    <>
      <div className="mb-3">
        <label className="form-label">Transfer Type <span className="text-danger">*</span></label>
        <select
          name="transferType"
          className={`form-select ${getError('TransferType') ? 'is-invalid' : ''}`}
          value={activity.transferType}
          onChange={(e) => onChange(index, e)}
          required
        >
          <option value="">Select transfer type...</option>
          <option value="airport_pickup">Airport Pickup</option>
          <option value="airport_dropoff">Airport Dropoff</option>
          <option value="city_transfer">City Transfer</option>
          <option value="hotel_transfer">Hotel Transfer</option>
        </select>
        {getError('TransferType') && (
          <div className="invalid-feedback">{getError('TransferType')}</div>
        )}
      </div>
    </>
  );

  const renderOtherFields = () => (
    <>
      <div className="mb-3">
        <label className="form-label">Service Description <span className="text-danger">*</span></label>
        <textarea
          name="description"
          className={`form-control ${getError('Description') ? 'is-invalid' : ''}`}
          rows="3"
          value={activity.description}
          onChange={(e) => onChange(index, e)}
          placeholder="Describe the service..."
          required
        />
        {getError('Description') && (
          <div className="invalid-feedback">{getError('Description')}</div>
        )}
      </div>
    </>
  );

  const showDateFields = activity.type === "hotel" || activity.type === "transfer";

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Activity #{index + 1}</h6>
        {index !== 0 && (
          <button 
            type="button" 
            className="btn btn-sm btn-outline-danger" 
            onClick={onRemove}
          >
            Remove
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label className="form-label">Activity Type <span className="text-danger">*</span></label>
          <select
            name="type"
            className={`form-control ${getError('Type') ? 'is-invalid' : ''}`}
            value={activity.type}
            onChange={(e) => onTypeChange(index, e.target.value)}
            required
          >
            <option value="">Select activity type...</option>
            <option value="hotel">Hotel</option>
            <option value="car_rental">Car Rental</option>
            <option value="transfer">Transfer</option>
            <option value="other">Other Service</option>
          </select>
          {getError('Type') && (
            <div className="invalid-feedback">{getError('Type')}</div>
          )}
        </div>

        {activity.type === "hotel" && renderHotelFields()}
        {activity.type === "car_rental" && renderCarRentalFields()}
        {activity.type === "transfer" && renderTransferFields()}
        {activity.type === "other" && renderOtherFields()}

        {showDateFields && (
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Check-In Date</label>
              <input
                type="date"
                name="checkIn"
                className={`form-control ${getError('CheckIn') ? 'is-invalid' : ''}`}
                value={activity.checkIn}
                onChange={(e) => onChange(index, e)}
              />
              {getError('CheckIn') && (
                <div className="invalid-feedback">{getError('CheckIn')}</div>
              )}
              {activity.checkIn && (
                <div className="form-text">{formatDate(activity.checkIn)}</div>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Check-Out Date</label>
              <input
                type="date"
                name="checkOut"
                className={`form-control ${getError('CheckOut') ? 'is-invalid' : ''}`}
                value={activity.checkOut}
                onChange={(e) => onChange(index, e)}
                min={activity.checkIn}
              />
              {getError('CheckOut') && (
                <div className="invalid-feedback">{getError('CheckOut')}</div>
              )}
              {activity.checkOut && (
                <div className="form-text">{formatDate(activity.checkOut)}</div>
              )}
            </div>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Amount ($) <span className="text-danger">*</span></label>
          <div className="input-group">
            <span className="input-group-text">$</span>
            <input
              type="number"
              name="amount"
              className={`form-control ${getError('Amount') ? 'is-invalid' : ''}`}
              value={activity.amount}
              onChange={(e) => onChange(index, e)}
              min="0"
              max="1000000"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          {getError('Amount') && (
            <div className="invalid-feedback d-block">{getError('Amount')}</div>
          )}
          {activity.amount && !getError('Amount') && (
            <div className="form-text text-success">
              ${parseFloat(activity.amount).toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityForm;