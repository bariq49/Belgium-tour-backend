import { Request, Response } from "express";
import adminService from "../services/admin.service";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess } from "../utils/response";
import { AppError } from "../errors/AppError";

class AdminController {
  getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.admin) throw new AppError("Unauthorized", 401);

    const admin = await adminService.getMe(req.admin._id.toString());
    return sendSuccess(res, { admin });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.admin) throw new AppError("Unauthorized", 401);

    const admin = await adminService.updateProfile(req.admin._id.toString(), req.body);
    return sendSuccess(res, { admin }, {
      message: "Profile updated successfully"
    });
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.admin) throw new AppError("Unauthorized", 401);

    await adminService.changePassword(req.admin._id.toString(), req.body);
    return sendSuccess(res, null, {
      message: "Password changed successfully"
    });
  });

  getOverview = asyncHandler(async (req: Request, res: Response) => {
    const months = req.query.months ? parseInt(req.query.months as string) : 6;
    const overview = await adminService.getDashboardOverview(months);
    return sendSuccess(res, overview);
  });
}

export default new AdminController();
