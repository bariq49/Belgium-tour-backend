import { IBooking } from "../../types/booking.types";

export const getBookingUserEmailTemplate = (booking: IBooking) => {
  const { orderNumber, customer, date, time, selectedPlan, priceBreakdown } = booking;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed – ${orderNumber}</title>
  <style>
    body { background: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; margin: 0; color: #333; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); }
    .header { background: #000000; padding: 40px 20px; text-align: center; color: #ffffff; }
    .header h1 { font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
    .header p { opacity: 0.8; font-size: 16px; margin: 10px 0 0; }
    
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #111; }
    .summary-card { background: #f9f9f9; border-radius: 8px; padding: 25px; margin-bottom: 30px; border: 1px solid #eeeeee; }
    
    .section-title { font-size: 12px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .detail-item { margin-bottom: 15px; }
    .detail-label { font-size: 12px; color: #888; margin-bottom: 4px; }
    .detail-value { font-size: 15px; font-weight: 700; color: #111; }
    
    .divider { height: 1px; background: #eee; margin: 25px 0; }
    
    .price-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
    .price-label { color: #666; }
    .price-value { font-weight: 600; color: #111; }
    .total-row { display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #eee; font-size: 18px; font-weight: 800; color: #000; }
    
    .footer { padding: 30px; text-align: center; font-size: 13px; color: #888; background: #fafafa; }
    .contact-info { margin-top: 15px; font-weight: 600; color: #555; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>Booking Confirmed!</h1>
      <p>Order #${orderNumber}</p>
    </div>

    <div class="content">
      <div class="greeting">Hi ${customer.fullName},</div>
      <p>Thank you for choosing us! Your booking has been successfully confirmed and your payment has been processed.</p>
      
      <div class="summary-card">
        <div class="section-title">Ride Details</div>
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">Date</div>
            <div class="detail-value">${date}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Time</div>
            <div class="detail-value">${time}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Rental Plan</div>
            <div class="detail-value">${selectedPlan?.name || "Standard Rental"}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Duration</div>
            <div class="detail-value">${selectedPlan?.duration} ${selectedPlan?.unit || "Hours"}</div>
          </div>
        </div>
      </div>

      <div class="section-title">Payment Summary</div>
      <div class="price-row">
        <span class="price-label">Base Price</span>
        <span class="price-value">$${priceBreakdown?.baseSubtotal?.toFixed(2)}</span>
      </div>
      ${priceBreakdown?.fuelFee ? `
      <div class="price-row">
        <span class="price-label">Prepaid Fuel</span>
        <span class="price-value">$${priceBreakdown.fuelFee.toFixed(2)}</span>
      </div>` : ''}
      ${priceBreakdown?.deliveryFee ? `
      <div class="price-row">
        <span class="price-label">Delivery Service</span>
        <span class="price-value">$${priceBreakdown.deliveryFee.toFixed(2)}</span>
      </div>` : ''}
      <div class="price-row">
        <span class="price-label">Tax & Fees</span>
        <span class="price-value">$${((priceBreakdown?.taxAmount || 0) + (priceBreakdown?.cardFeeAmount || 0) + (priceBreakdown?.tripProtectionFee || 0)).toFixed(2)}</span>
      </div>
      
      <div class="total-row">
        <span>Total Paid</span>
        <span>$${priceBreakdown?.total?.toFixed(2)}</span>
      </div>
    </div>

    <div class="footer">
      <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
      <div class="contact-info">support@golfclub.com</div>
      <p style="margin-top: 20px; font-size: 11px;">© 2026 Golf Club Rentals. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getBookingAdminEmailTemplate = (booking: IBooking) => {
  const { orderNumber, customer, date, time, selectedPlan, priceBreakdown } = booking;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEW BOOKING – ${orderNumber}</title>
  <style>
    body { background: #ebebeb; font-family: Arial, sans-serif; padding: 20px; margin: 0; color: #1a1a1a; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e0e0e0; }
    .header { background: #f9b233; padding: 30px; text-align: center; }
    .header h1 { font-weight: 800; font-size: 24px; color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
    
    .body { padding: 30px; }
    .section-title { font-size: 11px; font-weight: 800; color: #000; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 6px; }
    
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .details-table td { padding: 12px 0; border-bottom: 1px solid #f8f8f8; font-size: 14px; }
    .label { color: #888; font-weight: 500; width: 40%; }
    .value { color: #111; font-weight: 700; text-align: right; }
    
    .highlight-box { background: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #f9b233; }
    
    .footer { background: #000000; padding: 30px; text-align: center; color: #fff; }
    .footer p { font-size: 12px; margin: 0; opacity: 0.6; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>New Booking Received</h1>
    </div>

    <div class="body">
      <div class="highlight-box">
        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Order Number</div>
        <div style="font-size: 20px; font-weight: 800; color: #000;">${orderNumber}</div>
      </div>

      <div class="section-title">Customer Information</div>
      <table class="details-table">
        <tr><td class="label">Name</td><td class="value">${customer.fullName}</td></tr>
        <tr><td class="label">Email</td><td class="value">${customer.email}</td></tr>
        <tr><td class="label">Phone</td><td class="value">${customer.phone}</td></tr>
      </table>

      <div class="section-title">Ride Details</div>
      <table class="details-table">
        <tr><td class="label">Date</td><td class="value">${date}</td></tr>
        <tr><td class="label">Time</td><td class="value">${time}</td></tr>
        <tr><td class="label">Plan</td><td class="value">${selectedPlan?.name}</td></tr>
        <tr><td class="label">Duration</td><td class="value">${selectedPlan?.duration} ${selectedPlan?.unit}</td></tr>
      </table>

      <div class="section-title">Financials</div>
      <table class="details-table">
        <tr><td class="label">Total Amount</td><td class="value">$${priceBreakdown?.total?.toFixed(2)}</td></tr>
        <tr><td class="label">Payment Status</td><td class="value" style="color: #28a745;">PAID</td></tr>
      </table>
    </div>

    <div class="footer">
      <p>© 2026 Golf Club Administration Portal</p>
    </div>
  </div>
</body>
</html>
  `;
};
