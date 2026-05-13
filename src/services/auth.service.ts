import { Admin, IAdmin } from "../models/Admin";
import { Activity, IActivity } from "../models/Activity";
import { Session } from "../models/Session";
import { UAParser } from "ua-parser-js";
import { Types } from "mongoose";
import { AppError } from "../errors/AppError";
import { JwtUtil } from "../utils/jwt";

class AuthService {
  async findAdminById(id: string): Promise<IAdmin | null> {
    return Admin.findById(id);
  }

  async login(data: any, req: any): Promise<{ admin: IAdmin; accessToken: string; refreshToken: string }> {
    const admin = await Admin.findOne({ email: data.email }).select("+password");

    if (!admin) {
      throw new AppError("Invalid credentials", 401);
    }

    // 1. Check if account is locked
    if (admin.lockUntil && admin.lockUntil > new Date()) {
      throw new AppError("Account is temporarily locked. Please try again later.", 423);
    }

    // 2. Verify password
    if (!(await admin.comparePassword(data.password))) {
      await this.handleFailedLogin(admin, req);
      throw new AppError("Invalid credentials", 401);
    }

    // 3. Reset failed attempts on success
    admin.failedLoginAttempts = 0;
    admin.lockUntil = undefined;
    admin.lastLogin = new Date();
    await admin.save();

    // 4. Generate Tokens
    const accessToken = JwtUtil.generateAccessToken({ id: admin._id.toString() });
    const refreshToken = JwtUtil.generateRefreshToken({ id: admin._id.toString() });

    // 5. Create Session (Refresh Token Tracking)
    await this.createSession(admin._id.toString(), refreshToken, req);

    // 6. Log Activity (Non-blocking)
    this.logActivity(admin._id.toString(), req, "login").catch(console.error);

    return { admin, accessToken, refreshToken };
  }

  async refreshToken(token: string, _req: any): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = JwtUtil.verifyRefreshToken(token);
    const hashedToken = JwtUtil.hashToken(token);

    // 1. Find valid session
    const session = await Session.findOne({
      refreshToken: hashedToken,
      isValid: true,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      // Security: If token is valid but session not found, possible theft. Revoke all.
      await Session.updateMany({ admin: new Types.ObjectId(decoded.id) }, { isValid: false });
      throw new AppError("Invalid or compromised refresh token", 401);
    }

    // 2. Token Rotation: Generate new pair
    const newAccessToken = JwtUtil.generateAccessToken({ id: decoded.id });
    const newRefreshToken = JwtUtil.generateRefreshToken({ id: decoded.id });

    // 3. Update Session (Rotate Token)
    session.refreshToken = JwtUtil.hashToken(newRefreshToken);
    await session.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string, adminId: string): Promise<void> {
    const hashedToken = JwtUtil.hashToken(refreshToken);
    await Session.findOneAndUpdate({ refreshToken: hashedToken, admin: new Types.ObjectId(adminId) }, { isValid: false });
  }

  async logoutAllDevices(adminId: string): Promise<void> {
    await Promise.all([
      Session.updateMany({ admin: new Types.ObjectId(adminId) }, { isValid: false }),
      Admin.findByIdAndUpdate(adminId, { passwordChangedAt: new Date() })
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

    // Revoke all sessions on password change
    await Session.updateMany({ admin: admin._id }, { isValid: false });
    this.logActivity(admin._id.toString(), req, "password_change").catch(console.error);
  }

  private async createSession(adminId: string, token: string, req: any): Promise<void> {
    const parser = new UAParser(req.headers["user-agent"]);
    const result = parser.getResult();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days matches env default

    await Session.create({
      admin: new Types.ObjectId(adminId),
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
      const lockDuration = 30 * 60 * 1000; // 30 minutes
      admin.lockUntil = new Date(Date.now() + lockDuration);
      admin.failedLoginAttempts = 0; // Reset after lock
    }
    await admin.save();
    this.logActivity(admin._id.toString(), req, "login", "failed").catch(console.error);
  }

  async logActivity(adminId: string, req: any, type: IActivity["type"], status: IActivity["status"] = "success"): Promise<void> {
    try {
      const userAgent = req.headers["user-agent"] || "unknown";
      const parser = new UAParser(userAgent);
      const result = parser.getResult();

      await Activity.create({
        admin: new Types.ObjectId(adminId),
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

  async getActivities(adminId: string): Promise<any[]> {
    return Activity.find({ admin: new Types.ObjectId(adminId) }).sort({ timestamp: -1 }).limit(10).lean();
  }
}

export default new AuthService();
