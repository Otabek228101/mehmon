export const getValue = (obj, keys) => {
  if (!obj) return "";
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateForPDF = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: '2-digit' };
  return date.toLocaleDateString('en-US', options).toUpperCase();
};

export const getMinDate = (invoiceDate) => {
  if (!invoiceDate) return "";
  const invoice = new Date(invoiceDate);
  invoice.setFullYear(invoice.getFullYear() - 100);
  return invoice.toISOString().split('T')[0];
};

export const validateForm = (form) => {
  const errors = {};
  
  if (!form.clientName.trim()) errors.clientName = "This field is required";
  if (!form.clientEmail.trim()) errors.clientEmail = "This field is required";
  if (!form.clientPhone.trim()) errors.clientPhone = "This field is required";
  if (!form.receiptDate.trim()) errors.receiptDate = "This field is required";
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (form.clientEmail && !emailRegex.test(form.clientEmail)) {
    errors.clientEmail = "Please enter a valid email address";
  }
  
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  if (form.clientPhone && !phoneRegex.test(form.clientPhone)) {
    errors.clientPhone = "Please enter a valid phone number (10-15 digits)";
  }
  
  const amountPaid = parseFloat(form.amountPaid);
  if (isNaN(amountPaid) || amountPaid <= 0) {
    errors.amountPaid = "Total amount must be a positive number";
  }
  
  form.activities.forEach((activity, index) => {
    const amount = parseFloat(activity.amount);
    const errorPrefix = `activityAmount${index}`;
    if (isNaN(amount) || amount <= 0) {
      errors[errorPrefix] = "Amount must be a positive number";
    } else if (amount > 1000000) {
      errors[errorPrefix] = "Amount is too large (max $1,000,000)";
    }

    if (activity.checkIn && activity.checkOut) {
      if (new Date(activity.checkIn) > new Date(activity.checkOut)) {
        errors[`activityCheckOut${index}`] = "Check-out must be after check-in";
      }
    }

    if (activity.checkIn && form.receiptDate) {
      if (new Date(activity.checkIn) > new Date(form.receiptDate)) {
        errors[`activityCheckIn${index}`] = "Check-in date cannot be after invoice date";
      }
    }

    if (activity.type === 'car_rental') {
      if (!activity.pickupLocation?.trim()) {
        errors[`activityPickupLocation${index}`] = "Pickup location is required for car rental";
      }
      if (!activity.dropoffLocation?.trim()) {
        errors[`activityDropoffLocation${index}`] = "Dropoff location is required for car rental";
      }
      if (!activity.description?.trim()) {
        errors[`activityDescription${index}`] = "Operator comments are required for car rental";
      }
    }
  });

  return errors;
};