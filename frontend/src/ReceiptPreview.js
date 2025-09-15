import logo from "./logoBlack.png"; 
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

function ReceiptPreview({ data, onClick }) {
  const qrData = `${window.location.origin}/receipt/${data.id}?download=true`;

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

  const formatDateForPDF = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: '2-digit' 
    };
    return date.toLocaleDateString('en-US', options).toUpperCase();
  };

  const downloadPDF = async () => {
    if (!data) return;
<<<<<<< HEAD
=======
    const doc = new jsPDF();
    
    // Пропорциональное изменение размера логотипа
    const logoWidth = 50;
    const logoHeight = 40; // Новая высота для сохранения пропорций
    doc.addImage(logo, 'PNG', 10, 10, logoWidth, logoHeight);
    
    doc.setFontSize(16);
    doc.text(`Booking Number ${getValue(data, ['receiptNumber', 'receipt_number'])}`, 200, 20, { align: 'right' });
    
    doc.setFontSize(12);
    doc.text("This is your receipt", 10, 30);
    
    autoTable(doc, {
      startY: 40,
      head: [['YOUR DETAILS', '']],
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
>>>>>>> a3edced53b803d0f555694d23e1098330fa76021

    const doc = new jsPDF();

    const logoWidth = 80;
    const logoHeight = 20;
    doc.addImage(logo, 'PNG', 65, 20, logoWidth, logoHeight);

    doc.setLineWidth(0.5);
    doc.line(20, 50, 190, 50);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`BOOKING NUMBER: ${getValue(data, ['receiptNumber', 'receipt_number'])}`, 20, 60);
    doc.text(`DATE: ${formatDateForPDF(getValue(data, ['receiptDate', 'receipt_date']))}`, 20, 67);
    
    const receiptDate = new Date(getValue(data, ['receiptDate', 'receipt_date']));
    const dueDate = new Date(receiptDate);
    dueDate.setDate(dueDate.getDate() + 30);
    doc.text(`DUE DATE: ${formatDateForPDF(dueDate)}`, 20, 74);

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Bill To:', 20, 90);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Full Name: ${getValue(data, ['clientName', 'client_name'])}`, 20, 97);
    doc.text(`Email: ${getValue(data, ['clientEmail', 'client_email'])}`, 20, 104);
    doc.text(`Phone: ${getValue(data, ['clientPhone', 'client_phone'])}`, 20, 111);
    doc.text(`Date: ${formatDate(getValue(data, ['receiptDate', 'receipt_date']))}`, 20, 118);

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Method', 120, 90);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Uzum Bank', 150, 97);
    doc.text(`${getValue(data, ['clientName', 'client_name']).toUpperCase()}`, 120, 104);
    doc.text(`${getValue(data, ['clientPhone', 'client_phone'])}`, 120, 111);

    let currentY = 140;
    let totalAmount = 0;

    if (data.activities && data.activities.length > 0) {
      data.activities.forEach((activity) => {
        totalAmount += parseFloat(activity.amount || 0);

        let sectionTitle = 'ACTIVITY';
        if (activity.type) {
          sectionTitle = activity.type.toUpperCase().replace('_', ' ');
        } else if (getValue(activity, ['propertyName', 'property_name']).toLowerCase().includes('hotel')) {
          sectionTitle = 'HOTEL';
        } else if (getValue(activity, ['carModel', 'car_model'])) {
          sectionTitle = 'CAR RENTAL';
        }

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        const titleWidth = doc.getTextWidth(sectionTitle);
        doc.text(sectionTitle, (doc.internal.pageSize.width - titleWidth) / 2, currentY);
        currentY += 15;

        const activityData = [];
        
        if (getValue(activity, ['propertyName', 'property_name'])) {
          activityData.push(['Property', getValue(activity, ['propertyName', 'property_name'])]);
        }
        if (getValue(activity, ['propertyAddress', 'property_address'])) {
          activityData.push(['Address', getValue(activity, ['propertyAddress', 'property_address'])]);
        }
        if (getValue(activity, ['checkIn', 'check_in'])) {
          activityData.push(['Check-in', formatDate(getValue(activity, ['checkIn', 'check_in']))]);
        }
        if (getValue(activity, ['checkOut', 'check_out'])) {
          activityData.push(['Check-out', formatDate(getValue(activity, ['checkOut', 'check_out']))]);
        }
        if (getValue(activity, ['carModel', 'car_model'])) {
          activityData.push(['Car Model', getValue(activity, ['carModel', 'car_model'])]);
        }
        if (getValue(activity, ['carPlate', 'car_plate'])) {
          activityData.push(['Car Plate', getValue(activity, ['carPlate', 'car_plate'])]);
        }
        if (getValue(activity, ['pickupLocation', 'pickup_location'])) {
          activityData.push(['Pickup', getValue(activity, ['pickupLocation', 'pickup_location'])]);
        }
        if (getValue(activity, ['dropoffLocation', 'dropoff_location'])) {
          activityData.push(['Dropoff', getValue(activity, ['dropoffLocation', 'dropoff_location'])]);
        }
        if (getValue(activity, ['transferType', 'transfer_type'])) {
          activityData.push(['Transfer Type', getValue(activity, ['transferType', 'transfer_type'])]);
        }
        if (activity.description) {
          activityData.push(['Description', activity.description]);
        }
        activityData.push(['Amount', `$${parseFloat(activity.amount || 0).toFixed(2)}`]);

        // Изменен порядок в заголовке активности
        autoTable(doc, {
<<<<<<< HEAD
          startY: currentY,
          body: activityData,
=======
          startY: y,
          head: [[`Activity ${index + 1} - ${activity.type || 'Unknown'}`, '']],
          body: activityRows,
>>>>>>> a3edced53b803d0f555694d23e1098330fa76021
          theme: 'grid',
          styles: { 
            fontSize: 9, 
            cellPadding: 4,
            halign: 'left'
          },
          columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold', fillColor: [245, 245, 245] },
            1: { cellWidth: 120 }
          },
          margin: { left: 20, right: 20 },
        });

        currentY = doc.lastAutoTable.finalY + 20;
      });
    }

    // Add Total Amount
    const totalData = [
      ['Total Amount', `$${totalAmount.toFixed(2)}`]
    ];
    autoTable(doc, {
      startY: currentY,
      body: totalData,
      theme: 'grid',
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', fillColor: [245, 245, 245] },
        1: { cellWidth: 120 }
      },
      margin: { left: 20, right: 20 },
    });
    currentY = doc.lastAutoTable.finalY + 10;

    // Add footer text
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Your receipt is automatically generated. This is proof of your transaction - you can\'t', 20, currentY);
    currentY += 7;
    doc.text('use it to claim VAT.', 20, currentY);
    currentY += 15;

    doc.text('Contact Us:', 20, currentY);
    currentY += 7;
    doc.text('Phone: +998900001090', 20, currentY);
    currentY += 7;
    doc.text('Telegram: http://t.me/mehmon_contact', 20, currentY);
    currentY += 10;

    // Add QR code
    const qrImage = await QRCode.toDataURL(qrData, { errorCorrectionLevel: 'H' });
    const qrSize = 40;
    const qrX = 140;
    doc.addImage(qrImage, 'PNG', qrX, currentY - 40, qrSize, qrSize);
    doc.text('Scan to download PDF', qrX, currentY + 5);

    doc.save(`receipt_${getValue(data, ['receiptNumber', 'receipt_number'])}.pdf`);
  };

  return (
    <div className="card shadow" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <img src={logo} alt="MEHMON Logo" style={{ width: "170px", height: "40px" }} />
          <h5 style={{ margin: "0" }}>Booking Number {getValue(data, ['receiptNumber', 'receipt_number'])}</h5>
        </div>
        <p className="text-muted mb-2">This is your receipt</p>

<<<<<<< HEAD
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
                  <h6 className="card-title mb-2 text-capitalize">Activity {index + 1} - {activity.type || 'Unknown'}</h6>
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
=======
      {data.activities && data.activities.length > 0 && (
        <>
          <h6 className="mb-2 mt-3">ACTIVITIES</h6>
          {data.activities.map((activity, index) => (
            <div key={index} className="card mb-2 border-light">
              <div className="card-body p-3">
                {/* Изменен порядок в заголовке активности */}
                <h6 className="card-title mb-2 text-capitalize">Activity {index + 1} - {activity.type || 'Unknown'}</h6>
                <div className="row">
                  {getValue(activity, ['propertyName', 'property_name']) && (
>>>>>>> a3edced53b803d0f555694d23e1098330fa76021
                    <div className="col-12 mb-1">
                      <div className="row">
                        <div className="col-5"><strong>Amount:</strong></div>
                        <div className="col-7">${parseFloat(activity.amount || 0).toFixed(2)}</div>
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
                  <div className="col-6"><strong>${parseFloat(getValue(data, ['amountPaid', 'amount_paid']) || 0).toFixed(2)}</strong></div>
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
    </div>
  );
}

<<<<<<< HEAD
export default ReceiptPreview;
=======
export default ReceiptPreview;
>>>>>>> a3edced53b803d0f555694d23e1098330fa76021
