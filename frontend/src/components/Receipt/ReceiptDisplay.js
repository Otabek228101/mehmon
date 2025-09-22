import { getValue } from "../../utils/receiptUtils";

function ReceiptDisplay({ data, formatDate, isPreview = false }) {
  const getActivityTitle = (activity) => {
    let sectionTitle = 'ACTIVITY';
    if (activity.type) {
      sectionTitle = activity.type.toUpperCase().replace('_', ' ');
    } else if (getValue(activity, ['propertyName', 'property_name']).toLowerCase().includes('hotel')) {
      sectionTitle = 'HOTEL';
    } 
    return sectionTitle;
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="mb-3">
          <h6 className="text-primary">
            <strong>{getValue(data, ['receiptNumber', 'receipt_number'])}</strong>
          </h6>
          <small className="text-muted">
            {formatDate(getValue(data, ['receiptDate', 'receipt_date']))}
          </small>
        </div>

        <div className="mb-3">
          <h6 className="text-primary">Bill To:</h6>
          <p className="mb-1"><strong>{getValue(data, ['clientName', 'client_name'])}</strong></p>
          <p className="mb-1">{getValue(data, ['clientEmail', 'client_email'])}</p>
          <p className="mb-0">{getValue(data, ['clientPhone', 'client_phone'])}</p>
        </div>

        {data.activities && data.activities.length > 0 && (
          <div>
            {data.activities.map((activity, index) => (
              <div key={index} className="border-bottom pb-3 mb-3">
                <h6 className="text-uppercase fw-bold text-primary mb-2">
                  {getActivityTitle(activity)}
                </h6>
                
                {getValue(activity, ['propertyName', 'property_name']) && (
                  <div className="mb-2">
                    <small className="text-muted">Property:</small>
                    <div>{getValue(activity, ['propertyName', 'property_name'])}</div>
                  </div>
                )}
                
                {getValue(activity, ['propertyAddress', 'property_address']) && (
                  <div className="mb-2">
                    <small className="text-muted">Address:</small>
                    <div>{getValue(activity, ['propertyAddress', 'property_address'])}</div>
                  </div>
                )}
                
                {(getValue(activity, ['checkIn', 'check_in']) || getValue(activity, ['checkOut', 'check_out'])) && (
                  <>
                    {getValue(activity, ['checkIn', 'check_in']) && (
                      <div className="mb-2">
                        <small className="text-muted">Check-In:</small>
                        <div>{formatDate(getValue(activity, ['checkIn', 'check_in']))}</div>
                      </div>
                    )}
                    {getValue(activity, ['checkOut', 'check_out']) && (
                      <div className="mb-2">
                        <small className="text-muted">Check-Out:</small>
                        <div>{formatDate(getValue(activity, ['checkOut', 'check_out']))}</div>
                      </div>
                    )}
                  </>
                )}
                
                {activity.type === 'car_rental' && activity.description && (
                  <div className="mb-2">
                    <small className="text-muted">Operator Comments:</small>
                    <div>{activity.description}</div>
                  </div>
                )}
                
                {(getValue(activity, ['pickupLocation', 'pickup_location']) || getValue(activity, ['dropoffLocation', 'dropoff_location'])) && (
                  <div className="mb-2">
                    <small className="text-muted">Locations:</small>
                    <div>
                      {getValue(activity, ['pickupLocation', 'pickup_location']) && (
                        <span>Pickup: {getValue(activity, ['pickupLocation', 'pickup_location'])}</span>
                      )}
                      {getValue(activity, ['dropoffLocation', 'dropoff_location']) && (
                        <span>{' '}Dropoff: {getValue(activity, ['dropoffLocation', 'dropoff_location'])}</span>
                      )}
                    </div>
                  </div>
                )}
                
                {getValue(activity, ['transferType', 'transfer_type']) && (
                  <div className="mb-2">
                    <small className="text-muted">Transfer Type:</small>
                    <div>{getValue(activity, ['transferType', 'transfer_type'])}</div>
                  </div>
                )}
                
                {activity.description && activity.type !== 'car_rental' && (
                  <div className="mb-2">
                    <small className="text-muted">Description:</small>
                    <div>{activity.description}</div>
                  </div>
                )}
                
                <div className="text-end">
                  <strong>Amount: </strong>
                  ${parseFloat(getValue(activity, ['amount']) || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-end">
          <h5 className="text-success">
            Total: ${parseFloat(getValue(data, ['amountPaid', 'amount_paid']) || 0).toFixed(2)}
          </h5>
        </div>
      </div>
    </div>
  );
}

export default ReceiptDisplay;