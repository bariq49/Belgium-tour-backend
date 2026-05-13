import { ICustomTourRequest } from "../../types/custom-tour-request.types";

export const getCustomTourUserEmailTemplate = (request: ICustomTourRequest, tourTitle: string) => {
  const { requestNumber, firstName, date, durationNights, adultsCount, budgetPerPerson, specialRequests } = request;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Tour Request Received – ${requestNumber}</title>
  <style>
    body { background: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; margin: 0; color: #333; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #e0e0e0; }
    .header { background: #7D3C1F; padding: 40px 20px; text-align: center; color: #ffffff; }
    .header h1 { font-size: 24px; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
    .header p { opacity: 0.8; font-size: 14px; margin: 10px 0 0; text-transform: uppercase; letter-spacing: 1px; }
    
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #111; }
    
    .section-title { font-size: 12px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }
    
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .details-table td { padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px; }
    .label { color: #888; width: 40%; }
    .value { color: #111; font-weight: 700; text-align: right; }
    
    .special-box { background: #f9f9f9; border-radius: 8px; padding: 20px; margin-top: 20px; border: 1px solid #eeeeee; }
    .special-text { font-style: italic; color: #555; line-height: 1.5; }
    
    .footer { padding: 30px; text-align: center; font-size: 13px; color: #888; background: #fafafa; }
    .contact-info { margin-top: 15px; font-weight: 600; color: #7D3C1F; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>Custom Request Received</h1>
      <p>Request #${requestNumber}</p>
    </div>

    <div class="content">
      <div class="greeting">Hi ${firstName},</div>
      <p>Thank you for your interest in a personalized experience with Belgium Private Tour! We have received your custom tour request and our travel experts will review it shortly.</p>
      
      <div class="section-title">Request Summary</div>
      <table class="details-table">
        <tr><td class="label">Interested Tour</td><td class="value">${tourTitle}</td></tr>
        <tr><td class="label">Planned Date</td><td class="value">${new Date(date).toLocaleDateString()}</td></tr>
        <tr><td class="label">Duration</td><td class="value">${durationNights}</td></tr>
        <tr><td class="label">Adults</td><td class="value">${adultsCount}</td></tr>
        <tr><td class="label">Budget (Per Person)</td><td class="value">€${budgetPerPerson}</td></tr>
      </table>

      ${specialRequests ? `
      <div class="section-title">Special Requests</div>
      <div class="special-box">
        <div class="special-text">"${specialRequests}"</div>
      </div>
      ` : ''}

      <div style="margin-top: 30px;">
        <p>Our team will contact you at <strong>${request.phone}</strong> or <strong>${request.email}</strong> within 24-48 hours to discuss your personalized itinerary.</p>
      </div>
    </div>

    <div class="footer">
      <p>Need immediate assistance?</p>
      <div class="contact-info">info@belgiumprivatetours.com</div>
      <p style="margin-top: 20px; font-size: 11px;">© 2026 Belgium Private Tour. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getCustomTourAdminEmailTemplate = (request: ICustomTourRequest, tourTitle: string) => {
  const { requestNumber, firstName, lastName, email, phone, date, durationNights, adultsCount, budgetPerPerson, budgetFlexibility, specialRequests } = request;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEW CUSTOM REQUEST – ${requestNumber}</title>
  <style>
    body { background: #ebebeb; font-family: Arial, sans-serif; padding: 20px; margin: 0; color: #1a1a1a; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e0e0e0; }
    .header { background: #7D3C1F; padding: 30px; text-align: center; }
    .header h1 { font-weight: 800; font-size: 20px; color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
    
    .body { padding: 30px; }
    .section-title { font-size: 11px; font-weight: 800; color: #000; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 6px; }
    
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .details-table td { padding: 12px 0; border-bottom: 1px solid #f8f8f8; font-size: 14px; }
    .label { color: #888; font-weight: 500; width: 40%; }
    .value { color: #111; font-weight: 700; text-align: right; }
    
    .highlight-box { background: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #7D3C1F; }
    
    .footer { background: #000000; padding: 30px; text-align: center; color: #fff; }
    .footer p { font-size: 12px; margin: 0; opacity: 0.6; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>New Custom Tour Request</h1>
    </div>

    <div class="body">
      <div class="highlight-box">
        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Request Number</div>
        <div style="font-size: 20px; font-weight: 800; color: #000;">${requestNumber}</div>
      </div>

      <div class="section-title">Contact Information</div>
      <table class="details-table">
        <tr><td class="label">Name</td><td class="value">${firstName} ${lastName}</td></tr>
        <tr><td class="label">Email</td><td class="value">${email}</td></tr>
        <tr><td class="label">Phone</td><td class="value">${phone}</td></tr>
      </table>

      <div class="section-title">Tour Requirements</div>
      <table class="details-table">
        <tr><td class="label">Interested Tour</td><td class="value">${tourTitle}</td></tr>
        <tr><td class="label">Date</td><td class="value">${new Date(date).toLocaleDateString()}</td></tr>
        <tr><td class="label">Duration</td><td class="value">${durationNights}</td></tr>
        <tr><td class="label">Adults</td><td class="value">${adultsCount}</td></tr>
      </table>

      <div class="section-title">Budget & Preferences</div>
      <table class="details-table">
        <tr><td class="label">Budget p/p</td><td class="value">€${budgetPerPerson}</td></tr>
        <tr><td class="label">Flexibility</td><td class="value">${budgetFlexibility}</td></tr>
        <tr><td class="label">Special Requests</td><td class="value" style="text-align: left; padding-top: 10px; display: block; width: 100%;">${specialRequests || 'None'}</td></tr>
      </table>
    </div>

    <div class="footer">
      <p>© 2026 Belgium Private Tour Administration Portal</p>
    </div>
  </div>
</body>
</html>
  `;
};
