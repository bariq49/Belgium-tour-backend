// models/User.ts

import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  firstName: string;
  lastName: string;

  email: string;
  phoneNumber?: string;
  avatar?: string;
  companyName?: string;
  businessProfile?: string;

  password: string;

  role:
    | "traveler"
    | "travel_agency"
    | "dmc"
    | "hotel_partner";

  isVerified: boolean;

  status:
    | "pending"
    | "active"
    | "suspended";
  statusReason?: string;

  lastLogin?: Date;
  passwordChangedAt?: Date;

  failedLoginAttempts: number;
  lockUntil?: Date;

  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    phoneNumber: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    businessProfile: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "traveler",
        "travel_agency",
        "dmc",
        "hotel_partner",
      ],
      default: "traveler",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
    statusReason: {
      type: String,
      trim: true,
    },

    lastLogin: {
      type: Date,
    },

    passwordChangedAt: {
      type: Date,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User = model<IUser>("User", userSchema);