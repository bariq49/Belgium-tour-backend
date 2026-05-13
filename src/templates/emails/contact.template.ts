import { IContact } from "../../types/contact.types";

export const getContactAdminEmailTemplate = (contact: Partial<IContact>) => {
  const { fullName, email, phone, inquiryType, message } = contact;
  const displaySubject = inquiryType || "General Inquiry";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Inquiry – ${fullName}</title>
  <style>
    body { background: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; margin: 0; color: #333; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #eeeeee; }
    .header { background: #7D3C1F; padding: 40px 20px; text-align: center; color: #ffffff; }
    .header h1 { font-size: 24px; margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
    .header p { opacity: 0.8; font-size: 14px; margin: 10px 0 0; }
    
    .content { padding: 40px 30px; }
    .section-title { font-size: 12px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .details-table td { padding: 12px 0; border-bottom: 1px solid #f9f9f9; font-size: 14px; }
    .info-label { color: #888; font-weight: 500; width: 35%; }
    .info-value { color: #111; font-weight: 700; }
    
    .message-container { background: #f9f9f9; border-radius: 8px; padding: 25px; border-left: 4px solid #7D3C1F; margin-top: 10px; }
    .message-text { font-size: 15px; line-height: 1.6; color: #444; white-space: pre-wrap; }
    
    .footer { padding: 40px 30px; text-align: center; background: #fafafa; border-top: 1px solid #eee; }
    .reply-btn { display: inline-block; background: #7D3C1F; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 14px 30px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px; }
    .copyright { margin-top: 30px; font-size: 11px; color: #bbb; text-transform: uppercase; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>New Inquiry</h1>
      <p>Belgium Tour Support Request</p>
    </div>

    <div class="content">
      <div class="section-title">Sender Details</div>
      <table class="details-table">
        <tr><td class="info-label">Full Name</td><td class="info-value">${fullName}</td></tr>
        <tr><td class="info-label">Email</td><td class="info-value">${email}</td></tr>
        <tr><td class="info-label">Phone</td><td class="info-value">${phone || "Not provided"}</td></tr>
        <tr><td class="info-label">Inquiry Type</td><td class="info-value">${displaySubject}</td></tr>
      </table>

      <div class="section-title">Message Content</div>
      <div class="message-container">
        <div class="message-text">${message}</div>
      </div>
    </div>

    <div class="footer">
      <a href="mailto:${email}?subject=RE: Inquiry regarding ${displaySubject}" class="reply-btn">Reply to Customer</a>
      <div class="copyright">© 2026 Belgium Private Tour Portal</div>
    </div>
  </div>
</body>
</html>
  `;
};

export const getContactCustomerEmailTemplate = (contact: Partial<IContact>) => {
  const { fullName, inquiryType, message } = contact;
  const firstName = fullName?.split(" ")[0] || "Guest";
  const displaySubject = inquiryType || "General Inquiry";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We've Received Your Message</title>
  <style>
    body { background: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; margin: 0; color: #333; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #eeeeee; }
    .header { background: #7D3C1F; padding: 40px 20px; text-align: center; color: #ffffff; }
    .header h1 { font-size: 24px; margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
    .header p { opacity: 0.8; font-size: 14px; margin: 10px 0 0; }
    
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #111; }
    .intro-text { font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 30px; }
    
    .section-title { font-size: 12px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .message-card { background: #f9f9f9; border-radius: 8px; padding: 25px; border: 1px solid #f0f0f0; margin-bottom: 30px; font-style: italic; color: #444; line-height: 1.6; }
    
    .status-badge { display: inline-block; background: #e8f5e9; color: #2e7d32; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 20px; }
    
    .footer { padding: 40px 30px; text-align: center; background: #fafafa; border-top: 1px solid #eee; }
    .support-text { font-size: 13px; color: #888; margin-bottom: 20px; }
    .copyright { font-size: 11px; color: #bbb; text-transform: uppercase; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>Message Received</h1>
      <p>Thank you for reaching out to Belgium Tour</p>
    </div>

    <div class="content">
      <div class="status-badge">Inquiry Under Review</div>
      <div class="greeting">Hi ${firstName},</div>
      <p class="intro-text">
        We've received your inquiry regarding <strong>${displaySubject}</strong>. 
        Our team of travel specialists is already looking into your request and we'll get back to you within the next 24 hours to help plan your perfect Belgian journey.
      </p>

      <div class="section-title">Your Message Summary</div>
      <div class="message-card">
        "${message}"
      </div>

      <p class="intro-text" style="margin-bottom: 0;">
        We appreciate your patience. If this is an urgent matter, please feel free to reply directly to this email.
      </p>
    </div>

    <div class="footer">
      <p class="support-text">Belgium Private Tour Support Team</p>
      <div class="copyright">© 2026 Belgium Private Tour. ALL RIGHTS RESERVED.</div>
    </div>
  </div>
</body>
</html>
  `;
};
