import { Response } from "express";
import { env } from "../config/env";
import { sendSuccess } from "./response";

const isProduction = env.NODE_ENV === "production";

const getCookieOptions = (maxAgeInMs: number) => {
  const options: any = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
  };
  
  if (maxAgeInMs > 0) {
    options.expires = new Date(Date.now() + maxAgeInMs);
  }
  
  return options;
};

const parseDurationToMs = (duration: string): number => {
  const value = parseInt(duration);
  if (duration.endsWith("m")) return value * 60 * 1000;
  if (duration.endsWith("h")) return value * 60 * 60 * 1000;
  if (duration.endsWith("d")) return value * 24 * 60 * 60 * 1000;
  return value;
};

export const sendAuthResponse = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean = false,
  data: any = {}
) => {
  const accessMaxAge = parseDurationToMs(env.JWT_EXPIRES_IN);
  const refreshMaxAge = rememberMe ? parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN) : 0;

  res.cookie("accessToken", accessToken, getCookieOptions(accessMaxAge));
  res.cookie("refreshToken", refreshToken, getCookieOptions(refreshMaxAge));

  return sendSuccess(res, { ...data, accessToken }, { 
    message: "Authentication successful",
  });
};

export const clearAuthCookies = (res: Response) => {
  const clearOptions = { httpOnly: true, secure: isProduction, sameSite: isProduction ? ("none" as const) : ("lax" as const) };
  res.clearCookie("accessToken", clearOptions);
  res.clearCookie("refreshToken", clearOptions);
  
  return sendSuccess(res, undefined, { 
    message: "Logged out successfully" 
  });
};
