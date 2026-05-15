import { Schema, model, Document, Types } from "mongoose";
import type { AccountUserType, ActivityType, ActivityStatus } from "../types/account-auth";

export interface IActivity extends Document {
  user: Types.ObjectId;
  userType: AccountUserType;
  type: ActivityType;
  status: ActivityStatus;
  ipAddress: string;
  userAgent: string;
  device?: string;
  browser?: string;
  os?: string;
  timestamp: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userType: {
      type: String,
      enum: ["admin", "user"],
      required: true,
    },
    type: {
      type: String,
      enum: ["login", "logout", "password_change", "password_reset", "password_reset_request", "update_profile", "logout_all"],
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

activitySchema.index({ user: 1, userType: 1, timestamp: -1 });

export const Activity = model<IActivity>("Activity", activitySchema);
