import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import authService from "../services/auth.service";
import userAuthService from "../services/userAuth.service";
import { JwtUtil } from "../utils/jwt";
import type { AccountUserType } from "../types/account-auth";

const resolveAccountType = (decoded: { type?: AccountUserType }): AccountUserType => decoded.type ?? "admin";

export const protect = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError("Not authorized to access this route", 401));
    }

    const decoded = JwtUtil.verifyAccessToken(token);
    const accountType = resolveAccountType(decoded);

    if (accountType !== "admin") {
      return next(new AppError("Not authorized to access this route", 401));
    }

    const currentAdmin = await authService.findAdminById(decoded.id);
    if (!currentAdmin) {
      return next(new AppError("User no longer exists", 401));
    }

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

export const protectUser = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.userAccessToken) {
      token = req.cookies.userAccessToken;
    }

    if (!token) {
      return next(new AppError("Not authorized to access this route", 401));
    }

    const decoded = JwtUtil.verifyAccessToken(token);
    const accountType = resolveAccountType(decoded);

    if (accountType !== "user") {
      return next(new AppError("Not authorized to access this route", 401));
    }

    const currentUser = await userAuthService.findUserById(decoded.id);
    if (!currentUser) {
      return next(new AppError("User no longer exists", 401));
    }

    if (currentUser.passwordChangedAt) {
      const changedTimestamp = Math.floor(currentUser.passwordChangedAt.getTime() / 1000);
      if (decoded.iat! < changedTimestamp) {
        return next(new AppError("User recently changed password! Please log in again.", 401));
      }
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
  }
};
