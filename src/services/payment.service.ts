import { Payment } from "../models/Payment";
import { IPayment } from "../types/payment.types";
import bookingService from "./booking.service";
import APIFeature from "../utils/APIFeature";
import logger from "../utils/logger";

class PaymentService {
  async createPaymentRecord(paymentData: Partial<IPayment>) {
    const payment = new Payment(paymentData);
    return await payment.save();
  }

  async getPaymentByOrderNumber(orderNumber: string) {
    return await Payment.findOne({ orderNumber });
  }

  async handlePaymentSuccess(orderNumber: string, stripeData: any) {
    await bookingService.updateBookingStatus(orderNumber, "confirmed", "paid");
    return await Payment.findOneAndUpdate(
      { orderNumber },
      {
        status: "completed",
        amount: stripeData.amount,
        currency: stripeData.currency || "USD",
        paymentMethod: stripeData.paymentMethod || "card",
        stripeDetails: {
          sessionId: stripeData.sessionId,
          paymentIntentId: stripeData.paymentIntentId,
          receiptUrl: stripeData.receiptUrl,
          cardBrand: stripeData.cardBrand,
          cardLast4: stripeData.cardLast4,
        },
      },
      { new: true }
    );
  }

  async handlePaymentFailure(orderNumber: string, reason: string) {
    logger.warn(`Payment failed for order ${orderNumber}. Reason: ${reason}`);
    await bookingService.updateBookingStatus(orderNumber, "pending", "unpaid");

    return await Payment.findOneAndUpdate(
      { orderNumber },
      { status: "failed" },
      { new: true }
    );
  }

  async getAllPayments(queryString: Record<string, any>) {
    const features = new APIFeature(Payment as any, queryString, {
      search: { searchFields: ["orderNumber", "transactionId", "customerDetails.fullName", "customerDetails.email"] },
      filterFields: ["status", "paymentMethod"],
      populate: { path: "bookingId" },
      sort: { defaultSort: "-createdAt" },
    });

    const result = await features.execute();

    return {
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      },
    };
  }

  async countPayments(filter = {}) {
    return await Payment.countDocuments(filter);
  }

  async deletePayment(id: string): Promise<any> {
    return await Payment.findByIdAndDelete(id);
  }

  async bulkDeletePayments(ids: string[]): Promise<any> {
    return await Payment.deleteMany({ _id: { $in: ids } });
  }
}

export default new PaymentService();
