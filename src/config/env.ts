import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  EMAIL_FROM: string;
  DEFAULT_ADMIN_EMAIL: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  LOG_LEVEL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  FRONTEND_URL: string;
}

const getEnvConfig = (): EnvConfig => {
  const requiredEnvVars = [
    "MONGODB_URI",
    "EMAIL_HOST",
    "EMAIL_USER",
    "EMAIL_PASS",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "JWT_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(", ")}`;

    if (process.env.NODE_ENV === "production") {
      console.warn(`[ENV WARNING] ${errorMessage}`);
    } else {
      throw new Error(errorMessage);
    }
  }

  return {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "5000", 10),
    MONGODB_URI: process.env.MONGODB_URI || "",
    EMAIL_HOST: process.env.EMAIL_HOST || "",
    EMAIL_PORT: parseInt(process.env.EMAIL_PORT || "587", 10),
    EMAIL_USER: process.env.EMAIL_USER || "",
    EMAIL_PASS: process.env.EMAIL_PASS || "",
    EMAIL_FROM: process.env.EMAIL_FROM || "noreply@belgiumtour.com",
    DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || "admin@belgiumtour.com",
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    JWT_SECRET: process.env.JWT_SECRET || "default_secret_key_change_me",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "default_refresh_secret_key_change_me",
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  };
};

export const env = getEnvConfig();
