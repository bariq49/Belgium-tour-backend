import { Schema, model } from "mongoose";
import { IBooking } from "../types/booking.types";

const bookingSchema = new Schema<IBooking>(
  {
    orderNumber: { type: String, unique: true },
    tourId: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
    tourName: { type: String, required: true },
    date: { type: String, required: true },
    pickupTime: { type: String, required: true },
    travelersCount: { type: Number, required: true, default: 1 },
    language: { type: String, required: true },

    customer: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true },
      hotelName: { type: String, required: true },
      hotelAddress: { type: String, required: true },
      specialRequests: { type: String },
    },

    priceBreakdown: {
      basePrice: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `BT-${dateStr}-${randomStr}`;
  }
  next();
});


bookingSchema.index({ "customer.email": 1 });
bookingSchema.index({ status: 1 });

export const Booking = model<IBooking>("Booking", bookingSchema);
