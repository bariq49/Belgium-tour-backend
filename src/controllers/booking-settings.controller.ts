import { Request, Response } from "express";
import bookingSettingsService from "../services/booking-settings.service";
import { sendSuccess } from "../utils/response";
import { asyncHandler } from "../middleware/asyncHandler";

class BookingSettingsController {
  getSettings = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await bookingSettingsService.getSettings();
    return sendSuccess(res, settings, { message: "Booking settings retrieved" });
  });

  updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await bookingSettingsService.updateSettings(req.body);
    return sendSuccess(res, settings, { message: "Booking settings updated" });
  });
}

export default new BookingSettingsController();
