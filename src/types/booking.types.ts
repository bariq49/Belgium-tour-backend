import { Document, Types } from "mongoose";

export interface IBooking extends Document {
  orderNumber: string;
  tourId: Types.ObjectId | string;
  tourName: string;
  date: string;
  pickupTime: string;
  travelersCount: number;
  language: string;

  customer: {
    fullName: string;
    email: string;
    phone: string;
    hotelName: string;
    hotelAddress: string;
    specialRequests?: string;
  };

  priceBreakdown: {
    basePrice: number;
    totalPrice: number;
  };

  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "unpaid" | "paid" | "refunded";

  createdAt: Date;
  updatedAt: Date;
}
