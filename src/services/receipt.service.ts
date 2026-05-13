import bookingService from "./booking.service";
import paymentService from "./payment.service";
import { generateReceiptPdf } from "../templates/pdf/receipt.template";
import { AppError } from "../errors/AppError";

class ReceiptService {
  async generateBookingReceipt(orderNumber: string) {
    const booking = await bookingService.getBookingByOrderNumber(orderNumber);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    const payment = await paymentService.getPaymentByOrderNumber(orderNumber);

    const doc = generateReceiptPdf(booking.toObject(), payment ? payment.toObject() : null);
    const filename = `receipt-${booking.orderNumber}.pdf`;

    return { doc, filename };
  }
}

export default new ReceiptService();
