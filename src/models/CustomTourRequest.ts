import { Schema, model } from "mongoose";
import type { ICustomTourRequest } from "../types/custom-tour-request.types";

const customTourRequestSchema = new Schema<ICustomTourRequest>(
  {
    requestNumber: { type: String, unique: true },
    tourId: { type: Schema.Types.ObjectId, ref: "Tour", required: true },
    date: { type: Date, required: true },
    durationNights: { type: String, required: true },
    adultsCount: { type: Number, required: true, min: 1 },
    adultAges: { type: [String], default: [] },
    specialRequests: { type: String, default: "" },
    budgetPerPerson: { type: Number, required: true, min: 0 },
    budgetFlexibility: { 
      type: String, 
      enum: ["strict", "flexible", "unlimited"], 
      default: "strict" 
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    status: { 
      type: String, 
      enum: ["pending", "contacted", "booked", "cancelled"], 
      default: "pending" 
    },
  },
  { timestamps: true, collection: "custom_tour_requests" }
);

customTourRequestSchema.pre("save", async function (next) {
  if (!this.requestNumber) {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.requestNumber = `CTR-${dateStr}-${randomStr}`;
  }
  next();
});

customTourRequestSchema.index({ email: 1 });
customTourRequestSchema.index({ status: 1 });
customTourRequestSchema.index({ createdAt: -1 });

export const CustomTourRequest = model<ICustomTourRequest>("CustomTourRequest", customTourRequestSchema);
