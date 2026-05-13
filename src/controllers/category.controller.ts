import { Request, Response } from "express";
import categoryService from "../services/category.service";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess, sendError } from "../utils/response";

class CategoryController {
  getCategories = asyncHandler(async (req: Request, res: Response) => {
    const result = await categoryService.getAllCategories(req.query);
    return sendSuccess(res, result.data, { meta: result.meta });
  });

  createCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.createCategory(req.body);
    if (!category) {
      return sendError(res, "Could not create category", 400);
    }
    return sendSuccess(res, category, {
      message: "Category created successfully",
      statusCode: 201,
    });
  });

  updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    if (!category) {
      return sendError(res, "Category not found", 404);
    }
    return sendSuccess(res, category, { message: "Category updated successfully" });
  });

  deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.deleteCategory(req.params.id);
    if (!category) {
      return sendError(res, "Category not found", 404);
    }
    return sendSuccess(res, null, { message: "Category deleted successfully" });
  });

  bulkDeleteCategories = asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return sendError(res, "Category IDs are required", 400);
    }
    await categoryService.bulkDeleteCategories(ids);
    return sendSuccess(res, null, { message: "Categories deleted successfully" });
  });
}

export default new CategoryController();
