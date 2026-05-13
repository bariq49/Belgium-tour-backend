import { Schema, model, Document, Types } from "mongoose";

export interface IFleetPricing extends Document {
  fleetId: Types.ObjectId;
  duration: number; // Duration in hours
  price: number;
  label: string; // e.g., "1 Hour", "4 Hours", "Full Day (8 Hours)"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const fleetPricingSchema = new Schema<IFleetPricing>(
  {
    fleetId: { type: Schema.Types.ObjectId, ref: "Fleet", required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    label: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Removed unique index to allow more flexibility in pricing tiers
fleetPricingSchema.index({ fleetId: 1, duration: 1 });

export const FleetPricing = model<IFleetPricing>("FleetPricing", fleetPricingSchema);
