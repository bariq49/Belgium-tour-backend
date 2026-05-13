import mongoose from "mongoose";
import { Tour } from "../models/Tour";
import { Category } from "../models/Category";
import APIFeature from "../utils/APIFeature";
import type { CreateTourInput, TourListMeta, TourListResult, UpdateTourInput } from "../types/tour.types";

class TourService {
  async createTour(body: CreateTourInput) {
    const title = body.title?.trim();
    if (!title) return null;

    const categoryId = body.categoryId?.trim();
    if (!categoryId) return null;
    const category = await Category.findById(categoryId).select("_id").lean();
    if (!category) return null;

    const gallery = Array.isArray(body.galleryImages)
      ? body.galleryImages.map((u) => String(u).trim()).filter(Boolean)
      : [];

    const itinerarySteps = Array.isArray(body.itinerarySteps) ? body.itinerarySteps : [];
    const highlights = Array.isArray(body.highlights) ? body.highlights : [];

    const created = await Tour.create({
      title,
      category: categoryId,
      location: body.location.trim(),
      duration: body.duration.trim(),
      summary: body.summary.trim(),
      description: body.description.trim(),
      coverImage: body.coverImage.trim(),
      galleryImages: gallery,
      price: body.price,
      itinerarySteps,
      highlights,
      isCustom: body.isCustom ?? false,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
    });

    return Tour.findById(created._id).populate("category", "name slug").exec();
  }

  async getAllTours(queryString: Record<string, any>): Promise<TourListResult> {
    const features = new APIFeature(Tour as any, queryString, {
      search: { searchFields: ["title", "slug", "location", "summary", "description"] },
      filterFields: ["isActive", "category", "isCustom"],
      sort: { defaultSort: "sortOrder,title" },
      populate: { path: "category", select: "name slug" },
    });

    const result = await features.execute();

    const meta: TourListMeta = {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    };

    return { data: result.data, meta };
  }

  async getTourById(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }
    return Tour.findById(id).populate("category", "name slug").exec();
  }

  async updateTour(id: string, body: UpdateTourInput) {
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.categoryId !== undefined) {
      const cid = String(body.categoryId).trim();
      if (cid) {
        const category = await Category.findById(cid).select("_id").lean();
        if (!category) {
          return null;
        }
        updateData.category = cid;
      }
    }
    if (body.location !== undefined) updateData.location = String(body.location).trim();
    if (body.duration !== undefined) updateData.duration = String(body.duration).trim();
    if (body.summary !== undefined) updateData.summary = String(body.summary).trim();
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.coverImage !== undefined) updateData.coverImage = String(body.coverImage).trim();
    if (body.galleryImages !== undefined) {
      updateData.galleryImages = Array.isArray(body.galleryImages)
        ? body.galleryImages.map((u) => String(u).trim()).filter(Boolean)
        : [];
    }
    if (body.price !== undefined) updateData.price = body.price;
    if (body.itinerarySteps !== undefined) {
      updateData.itinerarySteps = Array.isArray(body.itinerarySteps) ? body.itinerarySteps : [];
    }
    if (body.highlights !== undefined) {
      updateData.highlights = Array.isArray(body.highlights) ? body.highlights : [];
    }
    if (body.isCustom !== undefined) updateData.isCustom = body.isCustom;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;

    if (Object.keys(updateData).length === 0) {
      return await Tour.findById(id).populate("category", "name slug").exec();
    }

    const updated = await Tour.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    if (!updated) {
      return null;
    }
    return Tour.findById(updated._id).populate("category", "name slug").exec();
  }

  async deleteTour(id: string) {
    return await Tour.findByIdAndDelete(id);
  }

  async bulkDeleteTours(ids: string[]) {
    await Tour.deleteMany({ _id: { $in: ids } });
  }
}

export default new TourService();
