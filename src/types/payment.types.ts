import { Document, Types } from "mongoose";

export interface IPayment extends Document {
  transactionId?: string;
  bookingId: Types.ObjectId;
  orderNumber: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod?: string;
  customerDetails: {
    fullName: string;
    email: string;
    phone: string;
  };
  stripeDetails?: {
    sessionId?: string;
    paymentIntentId?: string;
    receiptUrl?: string;
    cardBrand?: string;
    cardLast4?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
