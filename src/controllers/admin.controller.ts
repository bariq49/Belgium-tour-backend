import { Request, Response } from "express";
import adminService from "../services/admin.service";
import userAuthService from "../services/userAuth.service";
import { User } from "../models/User";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess } from "../utils/response";
import { AppError } from "../errors/AppError";
import emailService from "../services/email.service";

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

  updatePartner = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { status, statusReason } = req.body;

    let user;
    if (status === "active") {
      user = await userAuthService.approvePartner(userId);
    } else {
      user = await User.findById(userId);
      if (!user) throw new AppError("Partner not found", 404);

      const oldStatus = user.status;
      
      // Update fields
      if (status) {
        user.status = status;
        if (status === "active") {
          user.isVerified = true;
        }
      }
      if (statusReason !== undefined) user.statusReason = statusReason;
      
      await user.save();

      // Send email if status changed and it's not active (active handled by approvePartner)
      if (status && status !== oldStatus) {
        emailService.sendPartnerStatusChangeEmail(user, status, statusReason || "").catch(console.error);
      }
    }
    
    if (user && statusReason !== undefined) {
      user.statusReason = statusReason;
      await user.save();
    }

    return sendSuccess(res, user, {
      message: status === "active" 
        ? "Partner account approved and activation email sent."
        : "Partner updated successfully",
    });
  });

  getPartners = asyncHandler(async (req: Request, res: Response) => {
    const partners = await adminService.getPartners(req.query);
    return sendSuccess(res, partners);
  });

  getPartner = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const partner = await adminService.getPartnerById(userId);
    return sendSuccess(res, partner);
  });

  deletePartner = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    await adminService.deletePartnerById(userId);
    return sendSuccess(res, null, { message: "Partner account deleted successfully" });
  });
}

export default new AdminController();
