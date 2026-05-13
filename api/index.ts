import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/app";
import connectDB from "../src/config/database";
import logger from "../src/utils/logger";

export const config = {
  api: {
    bodyParser: false,
  },
};

let isConnecting = false;
let connectionPromise: Promise<void> | null = null;

const ensureDBConnection = async (): Promise<void> => {
  const mongoose = require("mongoose");
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (isConnecting && connectionPromise) {
    try {
      await connectionPromise;
      return;
    } catch (error) {
      connectionPromise = null;
      isConnecting = false;
    }
  }

  isConnecting = true;
  connectionPromise = connectDB()
    .then(() => {
      isConnecting = false;
      logger.info("Database connection established for serverless function");
    })
    .catch((error) => {
      isConnecting = false;
      connectionPromise = null;
      logger.error("Database connection failed in serverless function:", error);
    });

  await connectionPromise;
};

export default async function handler(
  vercelReq: VercelRequest,
  vercelRes: VercelResponse
): Promise<void> {
  try {
    const url = vercelReq.url || "";
    const path = url.split("?")[0];
    if (!path.match(/^\/(health)?$/)) {
      await ensureDBConnection();
    }
    return new Promise<void>((resolve) => {
      const originalEnd = vercelRes.end.bind(vercelRes);
      vercelRes.end = function (chunk?: any, encoding?: any, cb?: any): any {
        const result = originalEnd(chunk, encoding, cb);
        resolve();
        return result;
      };
      app(vercelReq as any, vercelRes as any);
    });
  } catch (error: any) {
    logger.error("Serverless function error:", {
      error: error.message,
      stack: error.stack,
      path: vercelReq.url,
    });

    // Send error response
    if (!vercelRes.headersSent) {
      vercelRes.status(500).json({
        success: false,
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}

