import { Request, Response } from "express";
import reviewService from "../services/review.service";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess, sendError } from "../utils/response";

class ReviewController {
  createReview = asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.createReview(req.body);
    if (!review) {
      return sendError(res, "Tour not found", 404);
    }
    return sendSuccess(res, review, {
      message: "Review submitted and is pending approval",
      statusCode: 201,
    });
  });

  getReviewsById = asyncHandler(async (req: Request, res: Response) => {
    const reviews = await reviewService.getReviewsById(req.params.id);
    if (reviews === null) {
      return sendError(res, "Tour not found", 404);
    }
    return sendSuccess(res, reviews);
  });

  getAllReviews = asyncHandler(async (req: Request, res: Response) => {
    const result = await reviewService.getAllReviews(req.query);
    return sendSuccess(res, result.data, { meta: result.meta });
  });

  updateReviewStatus = asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.updateReviewStatus(req.params.id, req.body);
    if (!review) {
      return sendError(res, "Review not found", 404);
    }
    return sendSuccess(res, review, { message: "Review updated" });
  });
}

export default new ReviewController();
