import mongoose from "mongoose";
import { Admin } from "../models/Admin";
import { env } from "../config/env";
import logger from "../utils/logger";

const seedAdmin = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("Connected to MongoDB for seeding");
    const adminExists = await Admin.findOne({ email: "info@thedevsquare.com" });

    if (adminExists) {
      logger.info("Admin already exists");
      process.exit(0);
    }

    const admin = new Admin({
      firstName: "Super",
      lastName: "Admin",
      email: "info@thedevsquare.com",
      password: "Thedevsquare0345",
      role: "admin",
    });

    await admin.save();
    logger.info("Admin seeded successfully");
    logger.info(`Email: info@thedevsquare.com`);
    logger.info(`Password: Thedevsquare0345`);

    process.exit(0);
  } catch (error) {
    logger.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
