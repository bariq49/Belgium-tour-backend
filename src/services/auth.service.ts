import { Admin, IAdmin } from "../models/Admin";
import { Activity, IActivity } from "../models/Activity";
import { Session } from "../models/Session";
import { UAParser } from "ua-parser-js";
import { Types } from "mongoose";
import { AppError } from "../errors/AppError";
import { JwtUtil, TokenPayload } from "../utils/jwt";
import type { AccountUserType } from "../types/account-auth";

const ADMIN_ACCOUNT: AccountUserType = "admin";

class AuthService {
  async findAdminById(id: string): Promise<IAdmin | null> {
    return Admin.findById(id);
  }

  private buildAdminTokenPayload(admin: IAdmin): TokenPayload {
    return {
      id: admin._id.toString(),
      role: admin.role,
      type: ADMIN_ACCOUNT,
    };
  }

  async login(data: any, req: any): Promise<{ admin: IAdmin; accessToken: string; refreshToken: string }> {
    const admin = await Admin.findOne({ email: data.email }).select("+password");

    if (!admin) {
      throw new AppError("Invalid credentials", 401);
    }

    if (admin.lockUntil && admin.lockUntil > new Date()) {
      throw new AppError("Account is temporarily locked. Please try again later.", 423);
    }

    if (!(await admin.comparePassword(data.password))) {
      await this.handleFailedLogin(admin, req);
      throw new AppError("Invalid credentials", 401);
    }

    admin.failedLoginAttempts = 0;
    admin.lockUntil = undefined;
    admin.lastLogin = new Date();
    await admin.save();

    const tokenPayload = this.buildAdminTokenPayload(admin);
    const accessToken = JwtUtil.generateAccessToken(tokenPayload);
    const refreshToken = JwtUtil.generateRefreshToken(tokenPayload);

    await this.createSession(admin._id.toString(), ADMIN_ACCOUNT, refreshToken, req);

    this.persistActivity(admin._id.toString(), ADMIN_ACCOUNT, req, "login").catch(console.error);

    return { admin, accessToken, refreshToken };
  }

  async refreshToken(token: string, _req: any): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = JwtUtil.verifyRefreshToken(token);
    const hashedToken = JwtUtil.hashToken(token);

    const session = await Session.findOne({
      refreshToken: hashedToken,
      isValid: true,
      expiresAt: { $gt: new Date() },
      userType: ADMIN_ACCOUNT,
    });

    if (!session) {
      await Session.updateMany(
        { user: new Types.ObjectId(decoded.id), userType: ADMIN_ACCOUNT },
        { isValid: false }
      );
      throw new AppError("Invalid or compromised refresh token", 401);
    }

    if (session.user.toString() !== decoded.id) {
      await Session.updateMany({ user: session.user, userType: ADMIN_ACCOUNT }, { isValid: false });
      throw new AppError("Invalid or compromised refresh token", 401);
    }

    const admin = await Admin.findById(session.user);
    if (!admin) {
      throw new AppError("Invalid or compromised refresh token", 401);
    }

    const tokenPayload = this.buildAdminTokenPayload(admin);
    const newAccessToken = JwtUtil.generateAccessToken(tokenPayload);
    const newRefreshToken = JwtUtil.generateRefreshToken(tokenPayload);

    session.refreshToken = JwtUtil.hashToken(newRefreshToken);
    await session.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string, adminId: string): Promise<void> {
    const hashedToken = JwtUtil.hashToken(refreshToken);
    await Session.findOneAndUpdate(
      { refreshToken: hashedToken, user: new Types.ObjectId(adminId), userType: ADMIN_ACCOUNT },
      { isValid: false }
    );
  }

  async logoutAllDevices(adminId: string): Promise<void> {
    await Promise.all([
      Session.updateMany({ user: new Types.ObjectId(adminId), userType: ADMIN_ACCOUNT }, { isValid: false }),
      Admin.findByIdAndUpdate(adminId, { passwordChangedAt: new Date() }),
    ]);
  }

  async changePassword(adminId: string, data: any, req: any): Promise<void> {
    const admin = await Admin.findById(adminId).select("+password");
    if (!admin || !(await admin.comparePassword(data.oldPassword))) {
      throw new AppError("Current password is incorrect", 401);
    }

    admin.password = data.newPassword;
    admin.passwordChangedAt = new Date();
    await admin.save();

    await Session.updateMany({ user: admin._id, userType: ADMIN_ACCOUNT }, { isValid: false });
    this.persistActivity(admin._id.toString(), ADMIN_ACCOUNT, req, "password_change").catch(console.error);
  }

  private async createSession(userId: string, userType: AccountUserType, token: string, req: any): Promise<void> {
    const parser = new UAParser(req.headers["user-agent"]);
    const result = parser.getResult();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await Session.create({
      user: new Types.ObjectId(userId),
      userType,
      refreshToken: JwtUtil.hashToken(token),
      ipAddress: req.ip || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
      device: result.device.model || "Desktop",
      browser: result.browser.name,
      os: result.os.name,
      expiresAt,
    });
  }

  private async handleFailedLogin(admin: IAdmin, req: any): Promise<void> {
    admin.failedLoginAttempts += 1;
    if (admin.failedLoginAttempts >= 5) {
      const lockDuration = 30 * 60 * 1000;
      admin.lockUntil = new Date(Date.now() + lockDuration);
      admin.failedLoginAttempts = 0;
    }
    await admin.save();
    this.persistActivity(admin._id.toString(), ADMIN_ACCOUNT, req, "login", "failed").catch(console.error);
  }

  private async persistActivity(
    accountId: string,
    userType: AccountUserType,
    req: any,
    type: IActivity["type"],
    status: IActivity["status"] = "success"
  ): Promise<void> {
    try {
      const userAgent = req.headers["user-agent"] || "unknown";
      const parser = new UAParser(userAgent);
      const result = parser.getResult();

      await Activity.create({
        user: new Types.ObjectId(accountId),
        userType,
        type,
        status,
        ipAddress: req.ip || "unknown",
        userAgent,
        device: result.device.model || "Desktop",
        browser: result.browser.name,
        os: result.os.name,
      });
    } catch (err) {
      console.error("Activity logging failed:", err);
    }
  }

  async logActivity(
    adminId: string,
    req: any,
    type: IActivity["type"],
    status: IActivity["status"] = "success"
  ): Promise<void> {
    return this.persistActivity(adminId, ADMIN_ACCOUNT, req, type, status);
  }

  async getActivities(adminId: string): Promise<any[]> {
    return Activity.find({ user: new Types.ObjectId(adminId), userType: ADMIN_ACCOUNT })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();
  }
}

export default new AuthService();
