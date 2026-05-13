import { Request, Response } from "express";
import bookingService from "../services/booking.service";
import paymentService from "../services/payment.service";
import receiptService from "../services/receipt.service";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess, sendError } from "../utils/response";

class BookingController {
  createBooking = asyncHandler(async (req: Request, res: Response) => {
    const result = await bookingService.createBooking(req.body);
    return sendSuccess(res, result, {
      message: "Booking created successfully. Redirecting to payment.",
      statusCode: 201,
    });
  });

  getBooking = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.getBookingByOrderNumber(req.params.orderNumber);
    if (!booking) {
      return sendError(res, "Booking not found", 404);
    }
    const payment = await paymentService.getPaymentByOrderNumber(req.params.orderNumber);

    return sendSuccess(res, {
      data: booking.toObject(),
      payment: payment ? payment.toObject() : null
    });
  });

  getReceipt = asyncHandler(async (req: Request, res: Response) => {
    const { doc, filename } = await receiptService.generateBookingReceipt(req.params.orderNumber);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-store");

    doc.pipe(res);
    doc.end();
  });

  getBookings = asyncHandler(async (req: Request, res: Response) => {
    const result = await bookingService.getAllBookings(req.query);
    return sendSuccess(res, result.data, { meta: result.meta });
  });

  getMyBookings = asyncHandler(async (req: Request, res: Response) => {
    const email = req.query.email as string;
    if (!email) {
      return sendError(res, "Email is required to fetch bookings", 400);
    }

    const result = await bookingService.getAllBookings();

    return sendSuccess(res, result.data, { meta: result.meta });
  });

  deleteBooking = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.deleteBooking(req.params.id);
    if (!booking) {
      return sendError(res, "Booking not found", 404);
    }
    return sendSuccess(res, null, { message: "Booking deleted successfully" });
  });

  bulkDeleteBookings = asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return sendError(res, "Booking IDs are required", 400);
    }
    await bookingService.bulkDeleteBookings(ids);
    return sendSuccess(res, null, { message: "Bookings deleted successfully" });
  });
}

export default new BookingController();
