import { IUser } from "../../models/User";
import { env } from "../../config/env";

const commonStyles = `
    body { background: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; margin: 0; color: #333; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #eeeeee; }
    .header { background: #7D3C1F; padding: 40px 20px; text-align: center; color: #ffffff; }
    .header h1 { font-size: 24px; margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
    .header p { opacity: 0.8; font-size: 14px; margin: 10px 0 0; }
    
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #111; }
    .intro-text { font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 30px; }
    
    .section-title { font-size: 12px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .details-table td { padding: 12px 0; border-bottom: 1px solid #f9f9f9; font-size: 14px; }
    .info-label { color: #888; font-weight: 500; width: 35%; }
    .info-value { color: #111; font-weight: 700; }
    
    .status-badge { display: inline-block; background: #e8f5e9; color: #2e7d32; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 20px; }
    .status-badge.pending { background: #fff8e1; color: #f57f17; }
    
    .footer { padding: 40px 30px; text-align: center; background: #fafafa; border-top: 1px solid #eee; }
    .cta-btn { display: inline-block; background: #7D3C1F; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 14px 30px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px; }
    .support-text { font-size: 13px; color: #888; margin-bottom: 20px; }
    .copyright { font-size: 11px; color: #bbb; text-transform: uppercase; letter-spacing: 1px; }
`;

export const getPartnerWelcomeEmailTemplate = (user: IUser) => {
  const roleName = user.role.replace("_", " ").toUpperCase();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Belgium Tour Partner Program</title>
  <style>${commonStyles}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>Application Received</h1>
      <p>Belgium Tour Partner Program</p>
    </div>

    <div class="content">
      <div class="status-badge pending">Application Pending Review</div>
      <div class="greeting">Dear ${user.firstName},</div>
      <p class="intro-text">
        Thank you for applying to join the Belgium Tour Partner Program as a <strong>${roleName}</strong>. 
        We've received your application and our team is currently reviewing your details.
      </p>

      <div class="section-title">Next Steps</div>
      <p class="intro-text">
        1. Our team will review your application within 2-3 business days.<br>
        2. Once approved, you will receive an email with instructions to set your password and access your dashboard.<br>
        3. If we need any additional information, we'll reach out to you directly.
      </p>

      <p class="intro-text" style="margin-bottom: 0;">
        We are excited about the possibility of working together to provide exceptional Belgian experiences.
      </p>
    </div>

    <div class="footer">
      <p class="support-text">Belgium Private Tour Partner Relations</p>
      <div class="copyright">© 2026 Belgium Private Tour. ALL RIGHTS RESERVED.</div>
    </div>
  </div>
</body>
</html>
  `;
};

export const getPartnerAdminNotificationEmailTemplate = (user: IUser) => {
  const roleName = user.role.replace("_", " ").toUpperCase();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Partner Application</title>
  <style>${commonStyles}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>New Partner Application</h1>
      <p>Action Required: Review Pending</p>
    </div>

    <div class="content">
      <div class="section-title">Applicant Details</div>
      <table class="details-table">
        <tr><td class="info-label">Full Name</td><td class="info-value">${user.firstName} ${user.lastName}</td></tr>
        <tr><td class="info-label">Email</td><td class="info-value">${user.email}</td></tr>
        <tr><td class="info-label">Phone</td><td class="info-value">${user.phoneNumber || "Not provided"}</td></tr>
        <tr><td class="info-label">Role</td><td class="info-value">${roleName}</td></tr>
      </table>

      <div style="text-align: center; margin-top: 20px;">
        <a href="${env.FRONTEND_URL}/admin/partners" class="cta-btn">Review Application</a>
      </div>
    </div>

    <div class="footer">
      <div class="copyright">© 2026 Belgium Private Tour Admin Portal</div>
    </div>
  </div>
</body>
</html>
  `;
};

export const getPartnerApprovalEmailTemplate = (user: IUser, resetToken: string) => {
  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${user.email}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Account has been Approved!</title>
  <style>${commonStyles}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>Account Approved</h1>
      <p>Welcome to Belgium Tour Partners</p>
    </div>

    <div class="content">
      <div class="status-badge">Account Active</div>
      <div class="greeting">Hi ${user.firstName},</div>
      <p class="intro-text">
        Great news! Your partner application has been approved. You can now access your dedicated dashboard to manage your bookings and services.
      </p>

      <div class="section-title">Set Your Password</div>
      <p class="intro-text">
        To get started, please click the button below to set your password and activate your account. This link will expire in 24 hours.
      </p>

      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${resetLink}" class="cta-btn">Set My Password</a>
      </div>

      <p class="intro-text" style="font-size: 13px; color: #888;">
        If the button above doesn't work, copy and paste this link into your browser:<br>
        ${resetLink}
      </p>
    </div>

    <div class="footer">
      <p class="support-text">Belgium Private Tour Partner Support</p>
      <div class="copyright">© 2026 Belgium Private Tour. ALL RIGHTS RESERVED.</div>
    </div>
  </div>
</body>
</html>
  `;
};

export const getPartnerStatusChangeEmailTemplate = (user: IUser, status: string, reason: string) => {
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const isSuspended = status === "suspended";
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Status Updated</title>
  <style>${commonStyles}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header" style="background: ${isSuspended ? '#d32f2f' : '#7D3C1F'};">
      <h1>Account Status Updated</h1>
      <p>Belgium Tour Partner Portal</p>
    </div>

    <div class="content">
      <div class="status-badge" style="background: ${isSuspended ? '#ffebee' : '#f5f5f5'}; color: ${isSuspended ? '#c62828' : '#616161'};">
        Account ${statusLabel}
      </div>
      <div class="greeting">Hi ${user.firstName},</div>
      <p class="intro-text">
        This is to inform you that your account status on the Belgium Tour Partner Portal has been updated to <strong>${statusLabel}</strong>.
      </p>

      <div class="section-title">Reason for Update</div>
      <p class="intro-text" style="background: #fdf2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #d32f2f; color: #111;">
        ${reason || "No specific reason provided by administration."}
      </p>

      <div class="section-title">What this means</div>
      <p class="intro-text">
        ${isSuspended 
          ? "While your account is suspended, you will not be able to log in or manage your bookings. This is often temporary and may be due to verification requirements or policy adherence."
          : "Your account status has been changed. If you believe this is an error or if you have any questions, please contact our support team."}
      </p>
    </div>

    <div class="footer">
      <p class="support-text">Questions? Contact support@belgiumprivatetour.com</p>
      <div class="copyright">© 2026 Belgium Private Tour. ALL RIGHTS RESERVED.</div>
    </div>
  </div>
</body>
</html>
  `;
};

export const getForgotPasswordEmailTemplate = (user: IUser, resetToken: string) => {
  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${user.email}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>${commonStyles}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>Password Reset</h1>
      <p>Belgium Tour Account Recovery</p>
    </div>

    <div class="content">
      <div class="greeting">Hi ${user.firstName},</div>
      <p class="intro-text">
        We received a request to reset the password for your Belgium Tour account. If you didn't make this request, you can safely ignore this email.
      </p>

      <div class="section-title">Reset Link</div>
      <p class="intro-text">
        Click the button below to set a new password. This link will expire in 1 hour for your security.
      </p>

      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${resetLink}" class="cta-btn">Reset Password</a>
      </div>

      <p class="intro-text" style="font-size: 13px; color: #888;">
        If the button above doesn't work, copy and paste this link into your browser:<br>
        ${resetLink}
      </p>
    </div>

    <div class="footer">
      <p class="support-text">Belgium Private Tour Support</p>
      <div class="copyright">© 2026 Belgium Private Tour. ALL RIGHTS RESERVED.</div>
    </div>
  </div>
</body>
</html>
  `;
};

