import { Booking } from "../models/Booking";
import { Payment } from "../models/Payment";
import { IBooking } from "../types/booking.types";
import APIFeature from "../utils/APIFeature";
import squareService from "./square.service";
import paymentService from "./payment.service";

class BookingService {
  async createBooking(bookingData: Partial<IBooking>) {
    const booking = new Booking(bookingData);
    await booking.save();

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

    return {
      booking,
      checkoutUrl: checkout.url,
      paymentLinkId: checkout.id,
    };
  }

  async getBookingById(id: string) {
    return await Booking.findById(id).populate("tourId");
  }

  async getBookingByOrderNumber(orderNumber: string) {
    return await Booking.findOne({ orderNumber }).populate("tourId");
  }

  async updateBookingStatus(orderNumber: string, status: string, paymentStatus?: string) {
    const updateData: any = { status };
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    return await Booking.findOneAndUpdate({ orderNumber }, updateData, { new: true });
  }

  async getAllBookings(queryString: Record<string, any> = {}) {
    const features = new APIFeature(Booking as any, queryString, {
      filterFields: ["status", "paymentStatus", "tourId"],
      populate: { path: "tourId" },
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

  async countBookings(filter = {}) {
    return await Booking.countDocuments(filter);
  }

  async deleteBooking(id: string): Promise<any> {
    await Payment.deleteMany({ bookingId: id });
    return await Booking.findByIdAndDelete(id);
  }

  async bulkDeleteBookings(ids: string[]): Promise<any> {
    await Payment.deleteMany({ bookingId: { $in: ids } });
    return await Booking.deleteMany({ _id: { $in: ids } });
  }
}

export default new BookingService();
