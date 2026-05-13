import { Document, Types } from "mongoose";

export interface TourItineraryStep {
  title: string;
  description: string;
}

export interface ITour extends Document {
  title: string;
  slug: string;
  category: Types.ObjectId;
  location: string;
  duration: string;
  summary: string;
  description: string;
  coverImage: string;
  galleryImages: string[];
  price: number;
  itinerarySteps: TourItineraryStep[];
  highlights: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTourInput {
  title: string;
  categoryId: string;
  location: string;
  duration: string;
  summary: string;
  description: string;
  coverImage: string;
  galleryImages?: string[] | null;
  price: number;
  itinerarySteps?: TourItineraryStep[] | null;
  highlights?: string[] | null;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateTourInput = Partial<CreateTourInput>;

export interface TourListMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface TourListResult {
  data: unknown[];
  meta: TourListMeta;
}
