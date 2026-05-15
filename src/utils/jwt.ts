import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";
import type { AccountUserType } from "../types/account-auth";

export interface TokenPayload {
  id: string;
  role: string;
  type: AccountUserType;
  iat?: number;
  exp?: number;
}

export class JwtUtil {
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  }

  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
