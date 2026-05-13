import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import authService from "../services/auth.service";
import { JwtUtil } from "../utils/jwt";

export const protect = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError("Not authorized to access this route", 401));
    }

    // 1. Verify access token
    const decoded = JwtUtil.verifyAccessToken(token);

    // 2. Check if admin exists
    const currentAdmin = await authService.findAdminById(decoded.id);
    if (!currentAdmin) {
      return next(new AppError("User no longer exists", 401));
    }

    // 3. Check if password was changed after token was issued
    if (currentAdmin.passwordChangedAt) {
      const changedTimestamp = Math.floor(currentAdmin.passwordChangedAt.getTime() / 1000);
      if (decoded.iat! < changedTimestamp) {
        return next(new AppError("User recently changed password! Please log in again.", 401));
      }
    }

    req.admin = currentAdmin;
    next();
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
  }
};
