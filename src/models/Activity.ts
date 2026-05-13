import { Schema, model, Document, Types } from "mongoose";

export interface IActivity extends Document {
  admin: Types.ObjectId;
  type: "login" | "logout" | "password_change" | "password_reset" | "logout_all";
  status: "success" | "failed";
  ipAddress: string;
  userAgent: string;
  device?: string;
  browser?: string;
  os?: string;
  timestamp: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    type: {
      type: String,
      enum: ["login", "logout", "password_change", "password_reset", "logout_all"],
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    device: {
      type: String,
    },
    browser: {
      type: String,
    },
    os: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
activitySchema.index({ admin: 1, timestamp: -1 });

export const Activity = model<IActivity>("Activity", activitySchema);
