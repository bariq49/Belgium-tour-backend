import { Schema, model } from "mongoose";
import { IPayment } from "../types/payment.types";

const paymentSchema = new Schema<IPayment>(
  {
    transactionId: { type: String, unique: true, sparse: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    orderNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "EUR" },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: { type: String },
    customerDetails: {
      fullName: { type: String },
      email: { type: String },
      phone: { type: String },
    },
    stripeDetails: {
      sessionId: { type: String },
      paymentIntentId: { type: String },
      receiptUrl: { type: String },
      cardBrand: { type: String },
      cardLast4: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.pre("save", async function (next) {
  if (!this.transactionId) {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.transactionId = `TID-${dateStr}-${randomStr}`;
  }
  next();
});

export const Payment = model<IPayment>("Payment", paymentSchema);
