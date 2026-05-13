import { Request, Response } from "express";
import customTourRequestService from "../services/custom-tour-request.service";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess, sendError } from "../utils/response";

class CustomTourRequestController {
  getRequests = asyncHandler(async (req: Request, res: Response) => {
    const result = await customTourRequestService.getAllRequests(req.query);
    return sendSuccess(res, result.data, { meta: result.meta });
  });

  getRequest = asyncHandler(async (req: Request, res: Response) => {
    const request = await customTourRequestService.getRequestById(req.params.id);
    if (!request) {
      return sendError(res, "Request not found", 404);
    }
    return sendSuccess(res, request);
  });

  createRequest = asyncHandler(async (req: Request, res: Response) => {
    const request = await customTourRequestService.createRequest(req.body);
    return sendSuccess(res, request, {
      message: "Custom tour request submitted successfully",
      statusCode: 201,
    });
  });

  updateRequest = asyncHandler(async (req: Request, res: Response) => {
    const request = await customTourRequestService.updateRequest(req.params.id, req.body);
    if (!request) {
      return sendError(res, "Request not found", 404);
    }
    return sendSuccess(res, request, { message: "Request updated successfully" });
  });

  deleteRequest = asyncHandler(async (req: Request, res: Response) => {
    const request = await customTourRequestService.deleteRequest(req.params.id);
    if (!request) {
      return sendError(res, "Request not found", 404);
    }
    return sendSuccess(res, null, { message: "Request deleted successfully" });
  });

  bulkDeleteRequests = asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return sendError(res, "Request IDs are required", 400);
    }
    await customTourRequestService.bulkDeleteRequests(ids);
    return sendSuccess(res, null, { message: "Requests deleted successfully" });
  });
}

export default new CustomTourRequestController();
