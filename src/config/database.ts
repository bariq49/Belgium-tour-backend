import mongoose from "mongoose";
import logger from "../utils/logger";

mongoose.set("bufferCommands", false);

if (!mongoose.connection.listeners("error").length) {
  mongoose.connection.on("error", (err) => {
    logger.error(`MongoDB connection error: ${err}`);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB reconnected");
  });

  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connected");
  });
}

const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (mongoose.connection.readyState === 2) {
    return new Promise((resolve, reject) => {
      mongoose.connection.once("connected", () => resolve());
      mongoose.connection.once("error", (err) => reject(err));
    });
  }

  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error("MongoDB URI is not defined in environment variables");
  }
  const isServerless = process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  const options: mongoose.ConnectOptions = {
    maxPoolSize: isServerless ? 5 : 10,
    minPoolSize: isServerless ? 1 : 5,
    serverSelectionTimeoutMS: isServerless ? 5000 : 10000,
    socketTimeoutMS: isServerless ? 30000 : 45000,
    connectTimeoutMS: isServerless ? 5000 : 10000,
  };

  try {
    await mongoose.connect(mongoURI, options);
    logger.info(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error}`);
    throw error;
  }
};

export default connectDB;

