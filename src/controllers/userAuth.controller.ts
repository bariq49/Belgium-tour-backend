import { Request, Response } from "express";
import userAuthService from "../services/userAuth.service";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess } from "../utils/response";
import { sendUserAuthResponse, clearUserAuthCookies } from "../utils/cookie";
import { AppError } from "../errors/AppError";

class UserAuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await userAuthService.register(req.body, req);

    if (user.status === "pending") {
      return sendSuccess(res, {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
          phoneNumber: user.phoneNumber,
        },
      }, {
        message: "Registration successful. Your application is pending review. We have sent you a welcome email.",
      });
    }

    return sendUserAuthResponse(res, accessToken, refreshToken, req.body.rememberMe, {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
      },
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await userAuthService.login(req.body, req);

    return sendUserAuthResponse(res, accessToken, refreshToken, req.body.rememberMe, {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
      },
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.userRefreshToken || req.body.refreshToken;
    if (!token) throw new AppError("Refresh token missing", 401);

    const { accessToken, refreshToken } = await userAuthService.refreshToken(token, req);

    return sendUserAuthResponse(res, accessToken, refreshToken);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.userRefreshToken || req.body.refreshToken;
    if (token && req.user) {
      await userAuthService.logout(token, req.user._id.toString());
      await userAuthService.logActivity(req.user._id.toString(), req, "logout");
    }
    return clearUserAuthCookies(res);
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    await userAuthService.changePassword(req.user._id.toString(), req.body, req);

    return sendSuccess(res, undefined, {
      message: "Password updated successfully. All other sessions revoked.",
    });
  });

  logoutAllDevices = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    await userAuthService.logoutAllDevices(req.user._id.toString());

    await userAuthService.logActivity(req.user._id.toString(), req, "logout_all");
    return clearUserAuthCookies(res);
  });

  getActivities = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const activities = await userAuthService.getActivities(req.user._id.toString());
    return sendSuccess(res, activities);
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    return sendSuccess(res, {
      user: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status,
        lastLogin: req.user.lastLogin,
        avatar: req.user.avatar,
        phoneNumber: req.user.phoneNumber,
      },
    });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await userAuthService.forgotPassword(req.body.email, req);
    return sendSuccess(res, undefined, {
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    await userAuthService.resetPassword(req.body, req);
    return sendSuccess(res, undefined, {
      message: "Password reset successfully. You can now log in with your new password.",
    });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const user = await userAuthService.updateProfile(req.user._id.toString(), req.body, req);

    return sendSuccess(res, {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber,
      },
    }, {
      message: "Profile updated successfully",
    });
  });
}

export default new UserAuthController();
