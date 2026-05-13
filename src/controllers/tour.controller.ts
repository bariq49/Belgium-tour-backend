import { Request, Response } from "express";
import tourService from "../services/tour.service";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess, sendError } from "../utils/response";

class TourController {
  getTours = asyncHandler(async (req: Request, res: Response) => {
    const result = await tourService.getAllTours(req.query);
    return sendSuccess(res, result.data, { meta: result.meta });
  });

  getCustomTours = asyncHandler(async (req: Request, res: Response) => {
    const query = { ...req.query, isCustom: "true" };
    const result = await tourService.getAllTours(query);
    return sendSuccess(res, result.data, { meta: result.meta });
  });

  getTour = asyncHandler(async (req: Request, res: Response) => {
    const tour = await tourService.getTourById(req.params.id);
    if (!tour) {
      return sendError(res, "Tour not found", 404);
    }
    return sendSuccess(res, tour);
  });

  createTour = asyncHandler(async (req: Request, res: Response) => {
    const tour = await tourService.createTour(req.body);
    if (!tour) {
      return sendError(res, "Could not create tour", 400);
    }
    return sendSuccess(res, tour, {
      message: "Tour created successfully",
      statusCode: 201,
    });
  });

  updateTour = asyncHandler(async (req: Request, res: Response) => {
    const tour = await tourService.updateTour(req.params.id, req.body);
    if (!tour) {
      return sendError(res, "Tour not found", 404);
    }
    return sendSuccess(res, tour, { message: "Tour updated successfully" });
  });

  deleteTour = asyncHandler(async (req: Request, res: Response) => {
    const tour = await tourService.deleteTour(req.params.id);
    if (!tour) {
      return sendError(res, "Tour not found", 404);
    }
    return sendSuccess(res, null, { message: "Tour deleted successfully" });
  });

  bulkDeleteTours = asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return sendError(res, "Tour IDs are required", 400);
    }
    await tourService.bulkDeleteTours(ids);
    return sendSuccess(res, null, { message: "Tours deleted successfully" });
  });
}

export default new TourController();
