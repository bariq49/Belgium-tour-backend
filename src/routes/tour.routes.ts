import { Router, type IRouter } from "express";
import tourController from "../controllers/tour.controller";
import reviewController from "../controllers/review.controller";
import { protect } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import {
  bulkDeleteToursSchema,
  createTourSchema,
  updateTourSchema,
} from "../validators/tour.validator";

const router: IRouter = Router();

router.get("/", tourController.getTours);
router.get("/:id/reviews", reviewController.getReviewsById);
router.get("/:id", tourController.getTour);

router.use(protect);
router.post("/", validateRequest(createTourSchema), tourController.createTour);
router.delete("/bulk", validateRequest(bulkDeleteToursSchema), tourController.bulkDeleteTours);
router.patch("/:id", validateRequest(updateTourSchema), tourController.updateTour);
router.delete("/:id", tourController.deleteTour);

export default router;
