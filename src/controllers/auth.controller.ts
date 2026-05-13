import { Request, Response } from "express";
import authService from "../services/auth.service";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess } from "../utils/response";
import { sendAuthResponse, clearAuthCookies } from "../utils/cookie";
import { AppError } from "../errors/AppError";

class AuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const { admin, accessToken, refreshToken } = await authService.login(req.body, req);

    return sendAuthResponse(res, accessToken, refreshToken, req.body.rememberMe, {
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) throw new AppError("Refresh token missing", 401);

    const { accessToken, refreshToken } = await authService.refreshToken(token, req);

    return sendAuthResponse(res, accessToken, refreshToken);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (token && req.admin) {
      await authService.logout(token, req.admin._id.toString());
      await authService.logActivity(req.admin._id.toString(), req, "logout");
    }
    return clearAuthCookies(res);
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.admin) throw new AppError("Unauthorized", 401);

    await authService.changePassword(req.admin._id.toString(), req.body, req);

    return sendSuccess(res, undefined, {
      message: "Password updated successfully. All other sessions revoked."
    });
  });

  logoutAllDevices = asyncHandler(async (req: Request, res: Response) => {
    if (!req.admin) throw new AppError("Unauthorized", 401);

    await authService.logoutAllDevices(req.admin._id.toString());

    await authService.logActivity(req.admin._id.toString(), req, "logout_all");
    return clearAuthCookies(res);
  });

  getActivities = asyncHandler(async (req: Request, res: Response) => {
    if (!req.admin) throw new AppError("Unauthorized", 401);

    const activities = await authService.getActivities(req.admin._id.toString());
    return sendSuccess(res, activities);
  });
}

export default new AuthController();
