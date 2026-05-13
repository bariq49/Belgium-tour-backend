import { Router, type IRouter } from "express";
import reviewController from "../controllers/review.controller";
import { protect } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import { createReviewSchema, updateReviewStatusSchema } from "../validators/review.validator";

const router: IRouter = Router();

router.post("/", validateRequest(createReviewSchema), reviewController.createReview);
router.get("/tour/:id", reviewController.getReviewsById);

router.use(protect);
router.get("/", reviewController.getAllReviews);
router.patch("/:id", validateRequest(updateReviewStatusSchema), reviewController.updateReviewStatus);

export default router;
