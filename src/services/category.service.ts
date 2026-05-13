import { Category } from "../models/Category";
import APIFeature from "../utils/APIFeature";
import type {
  CategoryListMeta,
  CategoryListResult,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/category.types";

class CategoryService {
  async createCategory(body: CreateCategoryInput) {
    const name = body.name?.trim();
    if (!name) return null;

    return Category.create({
      name,
      description: body.description,
      image: body.image,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
    });
  }

  async getAllCategories(queryString: Record<string, any>): Promise<CategoryListResult> {
    const features = new APIFeature(Category as any, queryString, {
      search: { searchFields: ["name", "slug", "description"] },
      filterFields: ["isActive"],
      sort: { defaultSort: "sortOrder,name" },
    });

    const result = await features.execute();

    const meta: CategoryListMeta = {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    };

    return { data: result.data, meta };
  }

  async updateCategory(id: string, body: UpdateCategoryInput) {
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      updateData.name = String(body.name).trim();
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    if (body.image !== undefined) {
      updateData.image = body.image;
    }
    if (body.sortOrder !== undefined) {
      updateData.sortOrder = body.sortOrder;
    }
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
    }
    if (body.metaTitle !== undefined) {
      updateData.metaTitle = body.metaTitle;
    }
    if (body.metaDescription !== undefined) {
      updateData.metaDescription = body.metaDescription;
    }

    if (Object.keys(updateData).length === 0) {
      return await Category.findById(id).exec();
    }

    return await Category.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
  }

  async deleteCategory(id: string) {
    return await Category.findByIdAndDelete(id);
  }

  async bulkDeleteCategories(ids: string[]) {
    await Category.deleteMany({ _id: { $in: ids } });
  }
}

export default new CategoryService();
