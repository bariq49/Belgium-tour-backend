import { Schema, model, Document, Types } from "mongoose";
import type { AccountUserType } from "../types/account-auth";

export interface ISession extends Document {
  user: Types.ObjectId;
  userType: AccountUserType;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  device?: string;
  browser?: string;
  os?: string;
  isValid: boolean;
  expiresAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userType: {
      type: String,
      enum: ["admin", "user"],
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    device: String,
    browser: String,
    os: String,
    isValid: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ user: 1, userType: 1 });

export const Session = model<ISession>("Session", sessionSchema);
