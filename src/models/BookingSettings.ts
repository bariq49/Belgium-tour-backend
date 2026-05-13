import { Schema, model, Document } from "mongoose";

export interface IBookingSettings extends Document {
  prepaidFuel: number;
  deliveryPickup: number;
  tripProtection: number;
  cardFee: number;
  tax: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSettingsSchema = new Schema<IBookingSettings>(
  {
    prepaidFuel: { type: Number, default: 0 },
    deliveryPickup: { type: Number, default: 0 },
    tripProtection: { type: Number, default: 0 },
    cardFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const BookingSettings = model<IBookingSettings>("BookingSettings", bookingSettingsSchema);
