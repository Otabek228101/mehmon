import logo from "./logoBlack.png"; 
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

function ReceiptPreview({ data, onClick }) {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); 
  };

  const getValue = (obj, keys) => {
    if (!obj) return "";
    
    for (const key of keys) {
      if (obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
        return obj[key];
      }
      
      const camelCaseKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      if (camelCaseKey !== key && obj.hasOwnProperty(camelCaseKey) && obj[camelCaseKey] !== undefined && obj[camelCaseKey] !== null && obj[camelCaseKey] !== "") {
        return obj[camelCaseKey];
      }
      
      const snakeCaseKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (snakeCaseKey !== key && obj.hasOwnProperty(snakeCaseKey) && obj[snakeCaseKey] !== undefined && obj[snakeCaseKey] !== null && obj[snakeCaseKey] !== "") {
        return obj[snakeCaseKey];
      }
    }
    
    return "";
  };

  const downloadPDF = async () => {
    if (!data) return;
    const doc = new jsPDF();
    
    doc.addImage(logo, 'PNG', 10, 10, 50, 12);
    
    doc.setFontSize(16);
    doc.text(`Booking Number ${getValue(data, ['receiptNumber', 'receipt_number'])}`, 200, 20, { align: 'right' });
    
    doc.setFontSize(12);
    doc.text("This is your receipt", 10, 30);
    
    autoTable(doc, {
      startY: 40,
      head: [['YOUR DETAILS']],
      body: [
        ['Name', getValue(data, ['clientName', 'client_name'])],
        ['Email', getValue(data, ['clientEmail', 'client_email'])],
        ['Phone', getValue(data, ['clientPhone', 'client_phone'])],
        ['Date', formatDate(getValue(data, ['receiptDate', 'receipt_date']))],
      ],
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
      margin: { left: 10, right: 10 },
    });

    let y = doc.lastAutoTable.finalY + 10;

    if (data.activities && data.activities.length > 0) {
      data.activities.forEach((activity, index) => {
        const activityRows = [];
        activityRows.push([`${activity.type || 'Unknown'} - Activity ${index + 1}`, '']);
        
        const propertyName = getValue(activity, ['propertyName', 'property_name']);
        if (propertyName) {
          activityRows.push(['Property', propertyName]);
        }
        
        const propertyAddress = getValue(activity, ['propertyAddress', 'property_address']);
        if (propertyAddress) {
          activityRows.push(['Address', propertyAddress]);
        }
        
        const checkIn = getValue(activity, ['checkIn', 'check_in']);
        if (checkIn) {
          activityRows.push(['Check-in', formatDate(checkIn)]);
        }
        
        const checkOut = getValue(activity, ['checkOut', 'check_out']);
        if (checkOut) {
          activityRows.push(['Check-out', formatDate(checkOut)]);
        }
        
        const carModel = getValue(activity, ['carModel', 'car_model']);
        if (carModel) {
          activityRows.push(['Car Model', carModel]);
        }
        
        const carPlate = getValue(activity, ['carPlate', 'car_plate']);
        if (carPlate) {
          activityRows.push(['Car Plate', carPlate]);
        }
        
        const pickupLocation = getValue(activity, ['pickupLocation', 'pickup_location']);
        if (pickupLocation) {
          activityRows.push(['Pickup', pickupLocation]);
        }
        
        const dropoffLocation = getValue(activity, ['dropoffLocation', 'dropoff_location']);
        if (dropoffLocation) {
          activityRows.push(['Dropoff', dropoffLocation]);
        }
        
        const transferType = getValue(activity, ['transferType', 'transfer_type']);
        if (transferType) {
          activityRows.push(['Transfer Type', transferType]);
        }
        
        if (activity.description) {
          activityRows.push(['Description', activity.description]);
        }
        
        activityRows.push(['Amount', `€${parseFloat(activity.amount || 0).toFixed(2)}`]);

        autoTable(doc, {
          startY: y,
          head: [[`ACTIVITY ${index + 1}`]],
          body: activityRows,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 2 },
          headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
          margin: { left: 10, right: 10 },
        });

        y = doc.lastAutoTable.finalY + 10;
        if (y > 250) {
          doc.addPage();
          y = 10;
        }
      });

      autoTable(doc, {
        startY: y,
        body: [['Total Amount', `€${parseFloat(getValue(data, ['amountPaid', 'amount_paid']) || 0).toFixed(2)}`]],
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2, fontStyle: 'bold' },
        margin: { left: 10, right: 10 },
      });

      y = doc.lastAutoTable.finalY + 10;
      if (y > 250) {
        doc.addPage();
        y = 10;
      }
    }

    doc.setFontSize(8);
    doc.text("Your receipt is automatically generated. This is proof of your transaction – you can't use it to claim VAT.", 10, y, { maxWidth: 180 });
    y += 10;
    if (y > 250) {
      doc.addPage();
      y = 10;
    }
    doc.text("Note: This isn't an invoice. A valid invoice for tax purposes can only be issued by the property.", 10, y, { maxWidth: 180 });
    y += 10;
    if (y > 250) {
      doc.addPage();
      y = 10;
    }

    try {
      const url = await new Promise((resolve, reject) => {
        QRCode.toDataURL(`${window.location.origin}/receipt/${data.id}?download=true`, { errorCorrectionLevel: 'H', width: 128 }, (err, url) => {
          if (err) reject(err);
          resolve(url);
        });
      });
      doc.addImage(url, 'PNG', 10, y, 40, 40);
      doc.text("Scan to download PDF", 10, y + 45);
      y += 55;
      if (y > 250) {
        doc.addPage();
        y = 10;
      }
    } catch (err) {
      console.error(err);
    }

    doc.setFontSize(10);
    doc.text("Contact Us:", 10, y);
    y += 5;
    doc.text("Phone: +998900091090, +393751060001", 10, y);
    y += 5;
    doc.text("Telegram: https://t.me/mehmon_contact", 10, y);
    
    doc.save(`receipt_${getValue(data, ['receiptNumber', 'receipt_number'])}.pdf`);
  };

  if (!data) {
    return <div>No data available</div>;
  }

  const qrData = `${window.location.origin}/receipt/${data.id}?download=true`;

  return (
    <div
      className="card shadow p-4"
      style={{ cursor: "pointer", border: "1px solid #ddd", borderRadius: "8px" }}
      onClick={onClick}
    >
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

      {data.activities && data.activities.length > 0 && (
        <>
          <h6 className="mb-2 mt-3">ACTIVITIES</h6>
          {data.activities.map((activity, index) => (
            <div key={index} className="card mb-2 border-light">
              <div className="card-body p-3">
                <h6 className="card-title mb-2 text-capitalize">{activity.type || 'Unknown'} - Activity {index + 1}</h6>
                <div className="row">
                  {getValue(activity, ['propertyName', 'property_name']) && (
                    <div className="col-12 mb-1">
                      <div className="row">
                        <div className="col-5"><strong>Property:</strong></div>
                        <div className="col-7">{getValue(activity, ['propertyName', 'property_name'])}</div>
                      </div>
                    </div>
                  )}
                  {getValue(activity, ['propertyAddress', 'property_address']) && (
                    <div className="col-12 mb-1">
                      <div className="row">
                        <div className="col-5"><strong>Address:</strong></div>
                        <div className="col-7">{getValue(activity, ['propertyAddress', 'property_address'])}</div>
                      </div>
                    </div>
                  )}
                  {getValue(activity, ['checkIn', 'check_in']) && (
                    <div className="col-12 mb-1">
                      <div className="row">
                        <div className="col-5"><strong>Check-in:</strong></div>
                        <div className="col-7">{formatDate(getValue(activity, ['checkIn', 'check_in']))}</div>
                      </div>
                    </div>
                  )}
                  {getValue(activity, ['checkOut', 'check_out']) && (
                    <div className="col-12 mb-1">
                      <div className="row">
                        <div className="col-5"><strong>Check-out:</strong></div>
                        <div className="col-7">{formatDate(getValue(activity, ['checkOut', 'check_out']))}</div>
                      </div>
                    </div>
                  )}
                  {getValue(activity, ['carModel', 'car_model']) && (
                    <div className="col-12 mb-1">
                      <div className="row">
                        <div className="col-5"><strong>Car Model:</strong></div>
                        <div className="col-7">{getValue(activity, ['carModel', 'car_model'])}</div>
                      </div>
                    </div>
                  )}
                  {getValue(activity, ['carPlate', 'car_plate']) && (
                    <div className="col-12 mb-1">
                      <div className="row">
                        <div className="col-5"><strong>Car Plate:</strong></div>
                        <div className="col-7">{getValue(activity, ['carPlate', 'car_plate'])}</div>
                      </div>
                    </div>
                  )}
                  {getValue(activity, ['pickupLocation', 'pickup_location']) && (
                    <div className="col-12 mb-1">
                      <div className="row">
                        <div className="col-5"><strong>Pickup:</strong></div>
                        <div className="col-7">{getValue(activity, ['pickupLocation', 'pickup_location'])}</div>
                      </div>
                    </div>
                  )}
                  {getValue(activity, ['dropoffLocation', 'dropoff_location']) && (
                    <div className="col-12 mb-1">
                      <div className="row">
                        <div className="col-5"><strong>Dropoff:</strong></div>
                        <div className="col-7">{getValue(activity, ['dropoffLocation', 'dropoff_location'])}</div>
                      </div>
                    </div>
                  )}
                  {getValue(activity, ['transferType', 'transfer_type']) && (
                    <div className="col-12 mb-1">
                      <div className="row">
                        <div className="col-5"><strong>Transfer Type:</strong></div>
                        <div className="col-7">{getValue(activity, ['transferType', 'transfer_type'])}</div>
                      </div>
                    </div>
                  )}
                  {activity.description && (
                    <div className="col-12 mb-1">
                      <div className="row">
                        <div className="col-5"><strong>Description:</strong></div>
                        <div className="col-7">{activity.description}</div>
                      </div>
                    </div>
                  )}
                  <div className="col-12 mb-1">
                    <div className="row">
                      <div className="col-5"><strong>Amount:</strong></div>
                      <div className="col-7">€{parseFloat(activity.amount || 0).toFixed(2)}</div>
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
      <button 
        className="btn btn-success w-100 mb-2" 
        onClick={(e) => {
          e.stopPropagation();
          downloadPDF();
        }}
        style={{ backgroundColor: "#28a745", border: "none", borderRadius: "5px", fontWeight: "500" }}
      >
        Download PDF
      </button>
      <div className="mt-3 text-center">
        <QRCodeSVG value={qrData} size={128} />
        <p className="text-muted small mt-2">Scan to download PDF</p>
      </div>
    </div>
  );
}

export default ReceiptPreview;