import { Payment } from "../models/Payment";
import paymentService from "./payment.service";
import bookingService from "./booking.service";
import emailService from "./email.service";
import stripeService from "./stripe.service";
import logger from "../utils/logger";

class WebhookService {
  async handleCheckoutSessionCompleted(session: any) {
    const orderNumber = session.metadata?.orderNumber;
    if (!orderNumber) {
      logger.warn(`Stripe session ${session.id} missing metadata orderNumber`);
      return;
    }

    const existing = await paymentService.getPaymentByOrderNumber(orderNumber);
    if (existing?.status === "completed") {
      logger.info(`Payment for ${orderNumber} already completed. Skipping.`);
      return;
    }

    const paymentIntentId = session.payment_intent as string;
    const charge = await stripeService.getLatestCharge(paymentIntentId);

    await paymentService.handlePaymentSuccess(orderNumber, {
      sessionId: session.id,
      paymentIntentId: paymentIntentId,
      amount: session.amount_total ? session.amount_total / 100 : undefined,
      currency: session.currency,
      paymentMethod: charge?.payment_method_details?.type || "card",
      receiptUrl: charge?.receipt_url,
      cardBrand: charge?.payment_method_details?.card?.brand,
      cardLast4: charge?.payment_method_details?.card?.last4,
    });

    const booking = await bookingService.getBookingByOrderNumber(orderNumber);
    if (booking) {
      await emailService.sendBookingConfirmationEmails(booking.toObject());
    }

    logger.info(`Stripe payment processed for order: ${orderNumber}`);
  }

  async handlePaymentIntentFailed(paymentIntent: any) {
    const orderNumber = paymentIntent.metadata?.orderNumber;
    if (!orderNumber) return;

    await paymentService.handlePaymentFailure(
      orderNumber,
      paymentIntent.last_payment_error?.message || "Stripe payment failed"
    );
    logger.warn(`Stripe payment failed for order: ${orderNumber}`);
  }

  async handleRefund(charge: any) {
    const orderNumber = charge.metadata?.orderNumber;
    if (!orderNumber) return;

    await bookingService.updateBookingStatus(orderNumber, "cancelled", "refunded");
    await Payment.findOneAndUpdate({ orderNumber }, { status: "refunded" });
    logger.info(`Processed Stripe refund for order: ${orderNumber}`);
  }

  async handleEvent(event: any) {
    const type = event.type;
    const object = event.data.object;

    switch (type) {
      case "checkout.session.completed": {
        await this.handleCheckoutSessionCompleted(object);
        break;
      }

      case "payment_intent.payment_failed": {
        await this.handlePaymentIntentFailed(object);
        break;
      }

      case "charge.refunded": {
        await this.handleRefund(object);
        break;
      }

      default:
        logger.debug(`Unhandled Stripe event type: ${type}`);
    }
  }
}

export default new WebhookService();
