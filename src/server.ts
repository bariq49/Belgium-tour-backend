import app from "./app";
import connectDB from "./config/database";
import { env } from "./config/env";
import logger from "./utils/logger";

const PORT = env.PORT || 5000;
const isServerless = process.env.VERCEL === "1";


if (!isServerless) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
      });
    })
    .catch((error) => {
      logger.error("Failed to start server:", error);
      process.exit(1);
    });
} else {
  connectDB().catch((error) => {
    logger.error("Failed to connect to database:", error);
  });
}
process.on("unhandledRejection", (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`, {
    stack: err.stack,
    serverless: isServerless,
  });
  if (!isServerless) {
    process.exit(1);
  }
});

process.on("uncaughtException", (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`, {
    stack: err.stack,
    serverless: isServerless,
  });
  if (!isServerless) {
    process.exit(1);
  }
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  if (!isServerless) {
    process.exit(0);
  }
});

export default app;

