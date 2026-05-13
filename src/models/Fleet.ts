import { Schema, model, Document } from "mongoose";

export interface IFleet extends Document {
  name: string;
  type: string; // e.g., "4 Seater", "6 Seater"
  description: string;
  mainImage: string;
  gallery: string[];
  features: string[];
  passengers: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const fleetSchema = new Schema<IFleet>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    mainImage: { type: String, required: true },
    gallery: [{ type: String }],
    features: [{ type: String }],
    passengers: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Fleet = model<IFleet>("Fleet", fleetSchema);
