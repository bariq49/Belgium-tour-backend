import mongoose from "mongoose";
import { Tour } from "../models/Tour";
import { Review } from "../models/Review";
import APIFeature from "../utils/APIFeature";
import type {
  CreateReviewInput,
  ReviewListMeta,
  ReviewListResult,
  UpdateReviewStatusInput,
} from "../types/review.types";

class ReviewService {
  async createReview(body: CreateReviewInput) {
    const tourId = body.tourId?.trim();
    if (!tourId || !mongoose.isValidObjectId(tourId)) return null;

    const tour = await Tour.findById(tourId).select("_id").lean();
    if (!tour) return null;

    const authorEmail =
      typeof body.authorEmail === "string" && body.authorEmail.trim().length > 0
        ? body.authorEmail.trim().toLowerCase()
        : undefined;

    const created = await Review.create({
      tour: tourId,
      authorName: body.authorName.trim(),
      authorEmail,
      rating: body.rating,
      comment: body.comment.trim(),
      status: "pending",
    });

    return Review.findById(created._id).populate("tour", "title slug").lean().exec();
  }

  async getReviewsById(tourId: string) {
    if (!mongoose.isValidObjectId(tourId)) {
      return null;
    }
    const tour = await Tour.findById(tourId).select("_id").lean();
    if (!tour) return null;

    return Review.find({ tour: tourId, status: "approved" })
      .sort({ createdAt: -1 })
      .limit(100)
      .select("authorName rating comment createdAt")
      .lean()
      .exec();
  }

  async getAllReviews(queryString: Record<string, any>): Promise<ReviewListResult> {
    const features = new APIFeature(Review as any, queryString, {
      search: { searchFields: ["authorName", "comment", "authorEmail"] },
      filterFields: ["status", "tour"],
      sort: { defaultSort: "-createdAt" },
      populate: { path: "tour", select: "title slug" },
    });

    const result = await features.execute();

    const meta: ReviewListMeta = {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    };

    return { data: result.data, meta };
  }

  async updateReviewStatus(id: string, body: UpdateReviewStatusInput) {
    if (!mongoose.isValidObjectId(id)) return null;

    const updated = await Review.findByIdAndUpdate(
      id,
      { $set: { status: body.status } },
      { new: true, runValidators: true }
    )
      .populate("tour", "title slug")
      .lean()
      .exec();

    return updated;
  }
}

export default new ReviewService();
