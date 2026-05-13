import { Document, Types } from "mongoose";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface IReview extends Document {
  tour: Types.ObjectId;
  authorName: string;
  authorEmail?: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewInput {
  tourId: string;
  authorName: string;
  authorEmail?: string | null;
  rating: number;
  comment: string;
}

export interface UpdateReviewStatusInput {
  status: ReviewStatus;
}

export interface ReviewListMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ReviewListResult {
  data: unknown[];
  meta: ReviewListMeta;
}
