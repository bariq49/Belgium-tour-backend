import { Request, Response } from "express";
import paymentService from "../services/payment.service";
import squareService from "../services/square.service";
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

    const checkout = await squareService.createCheckoutSession({
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
      squareDetails: {
        paymentLinkId: checkout.id,
        squareOrderId: checkout.orderId,
      },
    });

    return sendSuccess(res, { paymentLinkId: checkout.id, url: checkout.url });
  });

  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers["x-square-hmacsha256-signature"] as string;
    const rawBody = (req.body as Buffer).toString("utf8");

    const isValid = await squareService.verifyWebhook(rawBody, signature);
    if (!isValid) {
      logger.error("Square webhook signature verification failed");
      return res.status(400).send("Invalid signature");
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return res.status(400).send("Invalid JSON payload");
    }

    logger.info(`Received Square Webhook Event: ${event.type} [${event.event_id || event.id}]`);

    try {
      await webhookService.handleEvent(event);
    } catch (error: any) {
      logger.error(`Error processing webhook ${event.type}: ${error.message}`);
      return res.status(500).json({ error: "Internal processing error" });
    }

    return res.json({ received: true, eventId: event.event_id || event.id });
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
