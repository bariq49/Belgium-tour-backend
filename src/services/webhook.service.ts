import { Payment } from "../models/Payment";
import paymentService from "./payment.service";
import bookingService from "./booking.service";
import emailService from "./email.service";
import logger from "../utils/logger";

class WebhookService {
  private extractOrderNumber(note?: string | null): string | null {
    if (!note) return null;
    const match = note.match(/orderNumber:([^;]+)/);
    return match ? match[1] : null;
  }

  private async resolveOrderNumber(payment: any): Promise<string | null> {
    const fromNote = this.extractOrderNumber(payment?.note);
    if (fromNote) return fromNote;

    if (payment?.orderId) {
      const record = await Payment.findOne({ "squareDetails.squareOrderId": payment.orderId });
      if (record?.orderNumber) return record.orderNumber;
    }
    return null;
  }

  async handlePaymentCompleted(payment: any) {
    const orderNumber = await this.resolveOrderNumber(payment);
    if (!orderNumber) {
      logger.warn(`Square payment ${payment?.id} missing trackable orderNumber`);
      return;
    }

    const existing = await paymentService.getPaymentByOrderNumber(orderNumber);
    if (existing?.status === "completed") {
      logger.info(`Payment for ${orderNumber} already completed. Skipping.`);
      return;
    }

    const card = payment?.cardDetails?.card;
    await paymentService.handlePaymentSuccess(orderNumber, {
      paymentId: payment?.id,
      squareOrderId: payment?.orderId,
      amount: payment?.totalMoney?.amount ? Number(payment.totalMoney.amount) / 100 : undefined,
      currency: payment?.totalMoney?.currency,
      paymentMethod: payment?.sourceType?.toLowerCase() || "card",
      receiptUrl: payment?.receiptUrl,
      cardBrand: card?.cardBrand,
      cardLast4: card?.last4,
    });

    const booking = await bookingService.getBookingByOrderNumber(orderNumber);
    if (booking) {
      await emailService.sendBookingConfirmationEmails(booking.toObject());
    }

    logger.info(`Square payment processed for order: ${orderNumber}`);
  }

  async handlePaymentFailed(payment: any) {
    const orderNumber = await this.resolveOrderNumber(payment);
    if (!orderNumber) return;
    await paymentService.handlePaymentFailure(orderNumber, "Square payment failed");
    logger.warn(`Square payment failed for order: ${orderNumber}`);
  }

  async handleRefund(refund: any) {
    if (refund?.status !== "COMPLETED") return;

    const record = await Payment.findOne({ "squareDetails.paymentId": refund?.paymentId });
    if (!record) {
      logger.warn(`Refund received for unknown paymentId ${refund?.paymentId}`);
      return;
    }

    await bookingService.updateBookingStatus(record.orderNumber, "cancelled", "refunded");
    await Payment.findOneAndUpdate({ orderNumber: record.orderNumber }, { status: "refunded" });
    logger.info(`Processed refund for order: ${record.orderNumber}`);
  }

  async handleEvent(event: any) {
    const type = event?.type;
    const object = event?.data?.object;

    switch (type) {
      case "payment.created":
      case "payment.updated": {
        const payment = object?.payment;
        if (!payment) return;
        if (payment.status === "COMPLETED") {
          await this.handlePaymentCompleted(payment);
        } else if (payment.status === "FAILED" || payment.status === "CANCELED") {
          await this.handlePaymentFailed(payment);
        }
        break;
      }

      case "refund.created":
      case "refund.updated": {
        const refund = object?.refund;
        if (refund) await this.handleRefund(refund);
        break;
      }

      default:
        logger.debug(`Unhandled Square event type: ${type}`);
    }
  }
}

export default new WebhookService();
