import { Request, Response } from "express";
import paymentService from "../services/payment.service";
import stripeService from "../services/stripe.service";
import bookingService from "../services/booking.service";
import webhookService from "../services/webhook.service";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess, sendError } from "../utils/response";
import logger from "../utils/logger";

class PaymentController {
  createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
    const { bookingId } = req.body;

    if (!bookingId) {
      return sendError(res, "Booking ID is required", 400);
    }

    const booking = await bookingService.getBookingById(bookingId);
    if (!booking) {
      return sendError(res, "Booking not found", 404);
    }

    const checkout = await stripeService.createCheckoutSession({
      bookingId: booking._id.toString(),
      orderNumber: booking.orderNumber,
      amount: booking.priceBreakdown?.totalPrice || 0,
      customerEmail: booking.customer.email,
      customerName: booking.customer.fullName,
    });

    await paymentService.createPaymentRecord({
      bookingId: booking._id as any,
      orderNumber: booking.orderNumber,
      amount: booking.priceBreakdown?.totalPrice || 0,
      status: "pending",
      customerDetails: {
        fullName: booking.customer.fullName,
        email: booking.customer.email,
        phone: booking.customer.phone,
      },
      stripeDetails: {
        sessionId: checkout.id,
      },
    });

    return sendSuccess(res, { sessionId: checkout.id, url: checkout.url });
  });

  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const rawBody = (req.body as Buffer).toString("utf8");

    try {
      const event = await stripeService.constructEvent(rawBody, signature);
      logger.info(`Received Stripe Webhook Event: ${event.type} [${event.id}]`);
      
      await webhookService.handleEvent(event);
      return res.json({ received: true });
    } catch (error: any) {
      logger.error(`Stripe Webhook Error: ${error.message}`);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  getPaymentDetails = asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentService.getPaymentByOrderNumber(req.params.orderNumber);
    if (!payment) {
      return sendError(res, "Payment record not found", 404);
    }
    return sendSuccess(res, payment);
  });

  getPayments = asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentService.getAllPayments(req.query);
    return sendSuccess(res, result.data);
  });

  deletePayment = asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentService.deletePayment(req.params.id);
    if (!payment) {
      return sendError(res, "Payment record not found", 404);
    }
    return sendSuccess(res, null, { message: "Payment record deleted successfully" });
  });

  bulkDeletePayments = asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return sendError(res, "Payment IDs are required", 400);
    }
    await paymentService.bulkDeletePayments(ids);
    return sendSuccess(res, null, { message: "Payment records deleted successfully" });
  });
}

export default new PaymentController();
