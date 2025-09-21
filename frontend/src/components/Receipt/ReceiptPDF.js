import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import logo from "../../assets/logoBlack.png";
import QRCode from 'qrcode';
import { getValue, formatDateForPDF } from "../../utils/receiptUtils";

const downloadPDF = async (receiptData, qrUrl) => {
  if (!receiptData) return;

  const doc = new jsPDF();
  let currentY = 20;
  
  const logoWidth = 60; 
  const logoHeight = 15; 
  doc.addImage(logo, 'PNG', 75, currentY, logoWidth, logoHeight); 
  currentY += 25;

  doc.setLineWidth(0.5);
  doc.line(20, currentY, 190, currentY); 
  currentY += 15;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`BOOKING NUMBER: ${getValue(receiptData, ['receiptNumber', 'receipt_number'])}`, 20, currentY);
  currentY += 5;
  doc.text(`DATE: ${formatDateForPDF(getValue(receiptData, ['receiptDate', 'receipt_date']))}`, 20, currentY);
  currentY += 15;

  const billToY = currentY;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Bill To:', 20, billToY);
  let billToCurrentY = billToY + 8;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`Full Name: ${getValue(receiptData, ['clientName', 'client_name'])}`, 20, billToCurrentY);
  billToCurrentY += 5;
  doc.text(`Email: ${getValue(receiptData, ['clientEmail', 'client_email'])}`, 20, billToCurrentY);
  billToCurrentY += 5;
  doc.text(`Phone: ${getValue(receiptData, ['clientPhone', 'client_phone'])}`, 20, billToCurrentY);
  billToCurrentY += 5;
  doc.text(`Date: ${formatDateForPDF(getValue(receiptData, ['receiptDate', 'receipt_date']))}`, 20, billToCurrentY);
  
  const paymentY = billToY;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Payment Method', 120, paymentY);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('Uzum Bank', 120, paymentY + 8); 
  doc.text(`${getValue(receiptData, ['clientName', 'client_name']).toUpperCase()}`, 120, paymentY + 13);
  doc.text(`${getValue(receiptData, ['clientPhone', 'client_phone'])}`, 120, paymentY + 18);

  currentY = billToCurrentY + 10;

  let totalAmount = 0;

  if (receiptData.activities && receiptData.activities.length > 0) {
    receiptData.activities.forEach((activity, index) => {
      if (currentY > 220 && index > 0) {
        doc.addPage();
        currentY = 20;
      }

      let tableBody = [];
      
      if (getValue(activity, ['propertyName', 'property_name'])) {
        tableBody.push(['Property Name', getValue(activity, ['propertyName', 'property_name'])]);
      }
      
      if (getValue(activity, ['propertyAddress', 'property_address'])) {
        tableBody.push(['Address', getValue(activity, ['propertyAddress', 'property_address'])]);
      }

      if (activity.type !== 'car_rental' && 
          (getValue(activity, ['checkIn', 'check_in']) || getValue(activity, ['checkOut', 'check_out']))) {
        const datesText = [];
        if (getValue(activity, ['checkIn', 'check_in'])) {
          datesText.push(`Check-In: ${formatDateForPDF(getValue(activity, ['checkIn', 'check_in']))}`);
        }
        if (getValue(activity, ['checkOut', 'check_out'])) {
          datesText.push(`Check-Out: ${formatDateForPDF(getValue(activity, ['checkOut', 'check_out']))}`);
        }
        tableBody.push(['Dates', datesText.join(' | ')]);
      }

      if (activity.type === 'car_rental') {
        if (getValue(activity, ['pickupLocation', 'pickup_location'])) {
          tableBody.push(['Pickup Location', getValue(activity, ['pickupLocation', 'pickup_location'])]);
        }
        if (getValue(activity, ['dropoffLocation', 'dropoff_location'])) {
          tableBody.push(['Dropoff Location', getValue(activity, ['dropoffLocation', 'dropoff_location'])]);
        }
      }

      if (activity.type === 'transfer' && getValue(activity, ['transferType', 'transfer_type'])) {
        tableBody.push(['Transfer Type', getValue(activity, ['transferType', 'transfer_type'])]);
      }
      
      if (activity.description && activity.description.trim()) {
        tableBody.push(['Operator Comments', activity.description]);
      }
      
      tableBody.push(['Amount', `$${parseFloat(activity.amount || 0).toFixed(2)}`]);

      const activityAmount = parseFloat(activity.amount || 0);
      totalAmount += activityAmount;

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      let sectionTitle = 'ACTIVITY';
      if (activity.type) {
        sectionTitle = activity.type.toUpperCase().replace('_', ' ');
      }
      doc.text(sectionTitle, 20, currentY);
      currentY += 8; 

      autoTable(doc, {
        startY: currentY,
        head: [['Item', 'Details']],
        body: tableBody,
        styles: { 
          fontSize: 8, 
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          overflow: 'linebreak',
          minCellHeight: 3,
          valign: 'middle'
        },
        headStyles: { 
          fillColor: [241, 241, 241], 
          textColor: [0, 0, 0], 
          fontSize: 8 
        },
        bodyStyles: { minCellHeight: 3, fontSize: 8 },
        margin: { left: 20, right: 20 },
        tableWidth: 'auto',
        rowPageBreak: 'avoid'
      });

      currentY = doc.lastAutoTable.finalY + 8;
    });
  }

  if (currentY > 100) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Total Amount', 20, currentY);
  doc.text(`$${totalAmount.toFixed(2)}`, 170, currentY, { align: 'right' });
  currentY += 15;

  const qrSize = 50;
  const qrX = 150;
  const qrY = 250;
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, { 
      width: qrSize, 
      margin: 0,
      errorCorrectionLevel: 'M'
    });
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Scan to download', qrX, qrY + qrSize + 5);
  } catch (qrError) {
    console.error('QR Code generation failed:', qrError);
    doc.setFontSize(8);
    doc.text('QR Code unavailable', 20, currentY);
  }

  doc.save(`receipt_${getValue(receiptData, ['receiptNumber', 'receipt_number'])}.pdf`);
};

export default { downloadPDF };