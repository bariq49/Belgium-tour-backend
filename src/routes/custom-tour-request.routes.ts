import { Router, type IRouter } from "express";
import customTourRequestController from "../controllers/custom-tour-request.controller";
import { protect } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import {
  bulkDeleteCustomTourRequestsSchema,
  createCustomTourRequestSchema,
  updateCustomTourRequestSchema,
} from "../validators/custom-tour-request.validator";

const router: IRouter = Router();

// Public submission
router.post("/", validateRequest(createCustomTourRequestSchema), customTourRequestController.createRequest);

// Protected admin routes
router.use(protect);
router.get("/", customTourRequestController.getRequests);
router.get("/:id", customTourRequestController.getRequest);
router.delete("/bulk", validateRequest(bulkDeleteCustomTourRequestsSchema), customTourRequestController.bulkDeleteRequests);
router.patch("/:id", validateRequest(updateCustomTourRequestSchema), customTourRequestController.updateRequest);
router.delete("/:id", customTourRequestController.deleteRequest);

export default router;
