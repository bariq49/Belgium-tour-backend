import { Schema, model, type Model } from "mongoose";
import type { ICategory } from "../types/category.types";

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true, maxlength: 2000 },
    image: { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    metaTitle: { type: String, trim: true, maxlength: 70 },
    metaDescription: { type: String, trim: true, maxlength: 160 },
  },
  { timestamps: true, collection: "tourcategories" }
);

categorySchema.index({ isActive: 1, sortOrder: 1 });

categorySchema.pre("validate", async function (next) {
  if (!this.isNew || (this.slug && String(this.slug).trim().length > 0)) {
    return next();
  }

  const ModelRef = this.constructor as Model<ICategory>;
  const maxAttempts = 20;
  for (let i = 0; i < maxAttempts; i++) {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 8).toLowerCase();
    const candidate = `cat-${dateStr}-${randomStr}`;
    const collision = await ModelRef.findOne({ slug: candidate }).select("_id").lean();
    if (!collision) {
      this.slug = candidate;
      return next();
    }
  }
  next(new Error("Could not generate a unique category slug"));
});

export const Category = model<ICategory>("Category", categorySchema);
