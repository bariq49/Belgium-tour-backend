import { Schema, model } from "mongoose";
import type { IReview } from "../types/review.types";

const reviewSchema = new Schema<IReview>(
  {
    tour: { type: Schema.Types.ObjectId, ref: "Tour", required: true, index: true },
    authorName: { type: String, required: true, trim: true, maxlength: 120 },
    authorEmail: { type: String, trim: true, maxlength: 254, lowercase: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true, collection: "tour_reviews" }
);

reviewSchema.index({ tour: 1, status: 1, createdAt: -1 });

export const Review = model<IReview>("Review", reviewSchema);
