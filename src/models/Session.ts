import { Schema, model, Document, Types } from "mongoose";

export interface ISession extends Document {
  admin: Types.ObjectId;
  refreshToken: string; // Hashed refresh token
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
    admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
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
      index: { expires: 0 }, // TTL index for automatic cleanup
    },
  },
  {
    timestamps: true,
  }
);

export const Session = model<ISession>("Session", sessionSchema);
