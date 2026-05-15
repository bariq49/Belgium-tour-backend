import nodemailer from "nodemailer";
import { env } from "../config/env";
import logger from "../utils/logger";
import { getContactCustomerEmailTemplate, getContactAdminEmailTemplate } from "../templates/emails/contact.template";
import { getBookingUserEmailTemplate, getBookingAdminEmailTemplate } from "../templates/emails/booking-confirmation.template";
import { getCustomTourUserEmailTemplate, getCustomTourAdminEmailTemplate } from "../templates/emails/custom-tour.template";
import { 
  getPartnerWelcomeEmailTemplate, 
  getPartnerAdminNotificationEmailTemplate, 
  getPartnerApprovalEmailTemplate,
  getPartnerStatusChangeEmailTemplate,
  getForgotPasswordEmailTemplate
} from "../templates/emails/partner-auth.template";
import { IContact } from "../types/contact.types";
import { IBooking } from "../types/booking.types";
import { ICustomTourRequest } from "../types/custom-tour-request.types";
import { SendEmailOptions } from "../types/email.types";
import { IUser } from "../models/User";


class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
      pool: true,
      maxConnections: 5,
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    const { to, subject, html, replyTo, attachments } = options;
    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
        replyTo,
        attachments,
        disableFileAccess: true,
        disableUrlAccess: true,
      });
      return true;
    } catch (error: any) {
      logger.error(`Email error [${to}]:`, error.message);
      return false;
    }
  }

  getAdminEmail(): string {
    return (env.DEFAULT_ADMIN_EMAIL).split(",")[0].trim();
  }


  async sendContactEmails(contact: IContact) {
    const subject = contact.inquiryType || "General Inquiry";
    await Promise.all([
      this.sendEmail({
        to: contact.email,
        subject: `We Received Your Inquiry: ${subject}`,
        html: getContactCustomerEmailTemplate(contact),
      }),
      this.sendEmail({
        to: this.getAdminEmail(),
        subject: `NEW INQUIRY: ${contact.fullName} - ${subject}`,
        html: getContactAdminEmailTemplate(contact),
        replyTo: contact.email,
      }),
    ]).catch((err) => logger.error("Contact Email Error:", err));
  }

  async sendBookingConfirmationEmails(booking: IBooking) {
    try {
      await Promise.all([
        // Send to customer
        this.sendEmail({
          to: booking.customer.email,
          subject: `Booking Confirmed: Order #${booking.orderNumber}`,
          html: getBookingUserEmailTemplate(booking),
        }),
        // Send to admin
        this.sendEmail({
          to: this.getAdminEmail(),
          subject: `NEW BOOKING: ${booking.customer.fullName} - Order #${booking.orderNumber}`,
          html: getBookingAdminEmailTemplate(booking),
          replyTo: booking.customer.email,
        }),
      ]);
      logger.info(`Booking confirmation emails sent for order: ${booking.orderNumber}`);
    } catch (err) {
      logger.error(`Booking Email Error for order ${booking.orderNumber}:`, err);
    }
  }

  async sendCustomTourRequestEmails(request: ICustomTourRequest, tourTitle: string) {
    try {
      await Promise.all([
        // Send to customer
        this.sendEmail({
          to: request.email,
          subject: `Custom Tour Request Received: #${request.requestNumber}`,
          html: getCustomTourUserEmailTemplate(request, tourTitle),
        }),
        // Send to admin
        this.sendEmail({
          to: this.getAdminEmail(),
          subject: `NEW CUSTOM REQUEST: ${request.firstName} ${request.lastName} - #${request.requestNumber}`,
          html: getCustomTourAdminEmailTemplate(request, tourTitle),
          replyTo: request.email,
        }),
      ]);
      logger.info(`Custom tour request emails sent for: ${request.requestNumber}`);
    } catch (err) {
      logger.error(`Custom Tour Email Error for request ${request.requestNumber}:`, err);
    }
  }

  async sendPartnerWelcomeEmail(user: IUser) {
    try {
      await this.sendEmail({
        to: user.email,
        subject: "Partner Application Received - Belgium Tour",
        html: getPartnerWelcomeEmailTemplate(user),
      });
    } catch (err) {
      logger.error(`Partner Welcome Email Error [${user.email}]:`, err);
    }
  }

  async sendPartnerApplicationAdminEmail(user: IUser) {
    try {
      await this.sendEmail({
        to: this.getAdminEmail(),
        subject: `NEW PARTNER APPLICATION: ${user.firstName} ${user.lastName}`,
        html: getPartnerAdminNotificationEmailTemplate(user),
        replyTo: user.email,
      });
    } catch (err) {
      logger.error(`Partner Admin Notification Email Error:`, err);
    }
  }

  async sendPartnerApprovalEmail(user: IUser, resetToken: string) {
    try {
      await this.sendEmail({
        to: user.email,
        subject: "Your Account has been Approved - Belgium Tour",
        html: getPartnerApprovalEmailTemplate(user, resetToken),
      });
    } catch (err) {
      logger.error(`Partner Approval Email Error [${user.email}]:`, err);
    }
  }

  async sendPartnerStatusChangeEmail(user: IUser, status: string, reason: string) {
    try {
      await this.sendEmail({
        to: user.email,
        subject: `Account Status Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        html: getPartnerStatusChangeEmailTemplate(user, status, reason),
      });
    } catch (err) {
      logger.error(`Partner Status Change Email Error [${user.email}]:`, err);
    }
  }

  async sendForgotPasswordEmail(user: IUser, resetToken: string) {
    try {
      await this.sendEmail({
        to: user.email,
        subject: "Reset Your Password - Belgium Tour",
        html: getForgotPasswordEmailTemplate(user, resetToken),
      });
    } catch (err) {
      logger.error(`Forgot Password Email Error [${user.email}]:`, err);
    }
  }
}

export default new EmailService();

