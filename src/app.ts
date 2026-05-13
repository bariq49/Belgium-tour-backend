import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import logger from "./utils/logger";
import paymentController from "./controllers/payment.controller";

const app: Application = express();


app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  })
);

// Square Webhook MUST be mounted before the JSON parser and rate limiter:
//  - raw body is required for HMAC signature verification
//  - webhook deliveries from Square should never be rate-limited
app.post(
  "/api/webhooks/square",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(compression());

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Belgium Private Tour Backend API is working fine!",
    timestamp: new Date().toISOString(),
    status: "operational",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  const mongoose = require("mongoose");
  const dbStatus: number = mongoose.connection.readyState;

  const dbStatusMap: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatusMap[dbStatus] || "unknown",
      connected: dbStatus === 1,
    },
    environment: env.NODE_ENV,
  });
});
app.use(routes);
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;