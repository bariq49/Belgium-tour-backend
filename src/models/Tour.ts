import { Schema, model, type Model } from "mongoose";
import type { ITour } from "../types/tour.types";

const itineraryStepSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
  },
  { _id: false }
);

const tourSchema = new Schema<ITour>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    duration: { type: String, required: true, trim: true, maxlength: 80 },
    summary: { type: String, required: true, trim: true, maxlength: 600 },
    description: { type: String, required: true, trim: true, maxlength: 20000 },
    coverImage: { type: String, required: true, trim: true, maxlength: 2048 },
    galleryImages: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    itinerarySteps: { type: [itineraryStepSchema], default: [] },
    highlights: { type: [String], default: [] },
    isCustom: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "tours" }
);

tourSchema.index({ isActive: 1, sortOrder: 1 });
tourSchema.index({ category: 1 });

tourSchema.pre("validate", async function (next) {
  if (!this.isNew || (this.slug && String(this.slug).trim().length > 0)) {
    return next();
  }

  const ModelRef = this.constructor as Model<ITour>;
  const maxAttempts = 20;
  for (let i = 0; i < maxAttempts; i++) {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 8).toLowerCase();
    const candidate = `tour-${dateStr}-${randomStr}`;
    const collision = await ModelRef.findOne({ slug: candidate }).select("_id").lean();
    if (!collision) {
      this.slug = candidate;
      return next();
    }
  }
  next(new Error("Could not generate a unique tour slug"));
});

export const Tour = model<ITour>("Tour", tourSchema);
