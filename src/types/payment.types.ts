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
  squareDetails?: {
    paymentLinkId?: string;
    squareOrderId?: string;
    paymentId?: string;
    receiptUrl?: string;
    cardBrand?: string;
    cardLast4?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
