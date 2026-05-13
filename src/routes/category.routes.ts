import { Router, type IRouter } from "express";
import categoryController from "../controllers/category.controller";
import { protect } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import {
  createCategorySchema,
  updateCategorySchema,
  bulkDeleteCategoriesSchema,
} from "../validators/category.validator";

const router: IRouter = Router();

router.get("/", categoryController.getCategories);

router.use(protect);
router.post("/", validateRequest(createCategorySchema), categoryController.createCategory);
router.delete("/bulk", validateRequest(bulkDeleteCategoriesSchema), categoryController.bulkDeleteCategories);
router.patch("/:id", validateRequest(updateCategorySchema), categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;
