import { Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  description?: string | null;
  image?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface CategoryListMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CategoryListResult {
  data: unknown[];
  meta: CategoryListMeta;
}
