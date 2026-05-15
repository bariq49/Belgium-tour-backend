import { User, IUser } from "../models/User";
import { Activity, IActivity } from "../models/Activity";
import { Session } from "../models/Session";
import { UAParser } from "ua-parser-js";
import { Types } from "mongoose";
import crypto from "crypto";
import { AppError } from "../errors/AppError";
import emailService from "./email.service";
import { JwtUtil, TokenPayload } from "../utils/jwt";
import type { AccountUserType } from "../types/account-auth";

const USER_ACCOUNT: AccountUserType = "user";

const REGISTRATION_ROLES: IUser["role"][] = ["traveler", "travel_agency", "dmc", "hotel_partner"];

class UserAuthService {
  async findUserById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  private buildUserTokenPayload(user: IUser): TokenPayload {
    return {
      id: user._id.toString(),
      role: user.role,
      type: USER_ACCOUNT,
    };
  }

  async register(data: any, req: any): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const requestedRole = data.role as string | undefined;
    if (requestedRole === "admin") {
      throw new AppError("Invalid role", 400);
    }

    const role: IUser["role"] =
      requestedRole && REGISTRATION_ROLES.includes(requestedRole as IUser["role"])
        ? (requestedRole as IUser["role"])
        : "traveler";

    const existing = await User.findOne({ email: data.email?.toLowerCase?.() ?? data.email });
    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }

    const isPartner = ["travel_agency", "dmc", "hotel_partner"].includes(role);

    let user: IUser;
    try {
      user = await User.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || data.businessEmail,
        phoneNumber: data.phoneNumber || data.phone,
        companyName: data.companyName,
        businessProfile: data.businessProfile,
        password: data.password || "Partner@123", // Default password for partners, can be reset later
        role,
        status: isPartner ? "pending" : "active",
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new AppError("An account with this email already exists", 409);
      }
      throw err;
    }

    if (isPartner) {
      // Send registration emails for partners
      emailService.sendPartnerWelcomeEmail(user).catch(console.error);
      emailService.sendPartnerApplicationAdminEmail(user).catch(console.error);

      return { user, accessToken: "", refreshToken: "" }; // Don't return tokens for pending users
    }

    const tokenPayload = this.buildUserTokenPayload(user);
    const accessToken = JwtUtil.generateAccessToken(tokenPayload);
    const refreshToken = JwtUtil.generateRefreshToken(tokenPayload);

    await this.createSession(user._id.toString(), USER_ACCOUNT, refreshToken, req);

    return { user, accessToken, refreshToken };
  }

  async login(data: any, req: any): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await User.findOne({ email: data.email }).select("+password");

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new AppError("Account is temporarily locked. Please try again later.", 423);
    }

    if (user.status === "pending") {
      throw new AppError("Account is pending activation", 403);
    }

    if (user.status === "suspended") {
      throw new AppError("Account is suspended", 403);
    }

    if (user.status !== "active") {
      throw new AppError("Account is not active", 403);
    }

    if (!(await user.comparePassword(data.password))) {
      await this.handleFailedLogin(user, req);
      throw new AppError("Invalid credentials", 401);
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    const tokenPayload = this.buildUserTokenPayload(user);
    const accessToken = JwtUtil.generateAccessToken(tokenPayload);
    const refreshToken = JwtUtil.generateRefreshToken(tokenPayload);

    await this.createSession(user._id.toString(), USER_ACCOUNT, refreshToken, req);

    this.logActivityInternal(user._id.toString(), USER_ACCOUNT, req, "login").catch(console.error);

    return { user, accessToken, refreshToken };
  }

  async refreshToken(token: string, _req: any): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = JwtUtil.verifyRefreshToken(token);
    const hashedToken = JwtUtil.hashToken(token);

    const session = await Session.findOne({
      refreshToken: hashedToken,
      isValid: true,
      expiresAt: { $gt: new Date() },
      userType: USER_ACCOUNT,
    });

    if (!session) {
      await Session.updateMany(
        { user: new Types.ObjectId(decoded.id), userType: USER_ACCOUNT },
        { isValid: false }
      );
      throw new AppError("Invalid or compromised refresh token", 401);
    }

    if (session.user.toString() !== decoded.id) {
      await Session.updateMany({ user: session.user, userType: USER_ACCOUNT }, { isValid: false });
      throw new AppError("Invalid or compromised refresh token", 401);
    }

    const user = await User.findById(session.user);
    if (!user) {
      throw new AppError("Invalid or compromised refresh token", 401);
    }

    if (user.status !== "active") {
      throw new AppError("Account is not active", 403);
    }

    const tokenPayload = this.buildUserTokenPayload(user);
    const newAccessToken = JwtUtil.generateAccessToken(tokenPayload);
    const newRefreshToken = JwtUtil.generateRefreshToken(tokenPayload);

    session.refreshToken = JwtUtil.hashToken(newRefreshToken);
    await session.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string, userId: string): Promise<void> {
    const hashedToken = JwtUtil.hashToken(refreshToken);
    await Session.findOneAndUpdate(
      { refreshToken: hashedToken, user: new Types.ObjectId(userId), userType: USER_ACCOUNT },
      { isValid: false }
    );
  }

  async logoutAllDevices(userId: string): Promise<void> {
    await Promise.all([
      Session.updateMany({ user: new Types.ObjectId(userId), userType: USER_ACCOUNT }, { isValid: false }),
      User.findByIdAndUpdate(userId, { passwordChangedAt: new Date() }),
    ]);
  }

  async changePassword(userId: string, data: any, req: any): Promise<void> {
    const user = await User.findById(userId).select("+password");
    if (!user || !(await user.comparePassword(data.oldPassword))) {
      throw new AppError("Current password is incorrect", 401);
    }

    user.password = data.newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    await Session.updateMany({ user: user._id, userType: USER_ACCOUNT }, { isValid: false });
    this.logActivityInternal(user._id.toString(), USER_ACCOUNT, req, "password_change").catch(console.error);
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

  private async handleFailedLogin(user: IUser, req: any): Promise<void> {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      const lockDuration = 30 * 60 * 1000;
      user.lockUntil = new Date(Date.now() + lockDuration);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    this.logActivityInternal(user._id.toString(), USER_ACCOUNT, req, "login", "failed").catch(console.error);
  }

  async logActivity(
    userId: string,
    req: any,
    type: IActivity["type"],
    status: IActivity["status"] = "success"
  ): Promise<void> {
    return this.logActivityInternal(userId, USER_ACCOUNT, req, type, status);
  }

  private async logActivityInternal(
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

  async getActivities(userId: string): Promise<any[]> {
    return Activity.find({ user: new Types.ObjectId(userId), userType: USER_ACCOUNT })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();
  }

  async approvePartner(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (user.status === "active") {
      throw new AppError("User is already active", 400);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.status = "active";
    user.isVerified = true;
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send approval email with reset link
    emailService.sendPartnerApprovalEmail(user, resetToken).catch(console.error);

    return user;
  }

  async forgotPassword(email: string, req: any): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    await user.save();

    await emailService.sendForgotPasswordEmail(user, resetToken);
    this.logActivityInternal(user._id.toString(), USER_ACCOUNT, req, "password_reset_request").catch(console.error);
  }

  async resetPassword(data: any, req: any): Promise<void> {
    const hashedToken = crypto.createHash("sha256").update(data.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      throw new AppError("Token is invalid or has expired", 400);
    }

    user.password = data.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    // Revoke all sessions after password reset
    await Session.updateMany({ user: user._id, userType: USER_ACCOUNT }, { isValid: false });
    
    this.logActivityInternal(user._id.toString(), USER_ACCOUNT, req, "password_reset").catch(console.error);
  }

  async updateProfile(userId: string, data: any, req: any): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const allowedUpdates = ["firstName", "lastName", "phoneNumber", "avatar", "companyName", "businessProfile"];
    
    Object.keys(data).forEach((key) => {
      if (allowedUpdates.includes(key) && data[key] !== undefined) {
        (user as any)[key] = data[key];
      }
    });

    await user.save();
    this.logActivityInternal(user._id.toString(), USER_ACCOUNT, req, "update_profile").catch(console.error);
    return user;
  }
}

export default new UserAuthService();
