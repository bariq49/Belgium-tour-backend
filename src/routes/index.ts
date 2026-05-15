import { Router, type IRouter } from "express";
import uploadRoutes from "./upload.routes";
import adminAuthRoutes from "./admin-auth.routes";
import userAuthRoutes from "./user-auth.routes";
import adminRoutes from "./admin.routes";
import contactRoutes from "./contact.routes";
import bookingSettingsRoutes from "./booking-settings.routes";
import bookingRoutes from "./booking.routes";
import paymentRoutes from "./payment.routes";
import dashboardRoutes from "./dashboard.routes";
import categoryRoutes from "./category.routes";
import tourRoutes from "./tour.routes";
import customTourRequestRoutes from "./custom-tour-request.routes";
import reviewRoutes from "./review.routes";

const router: IRouter = Router();
router.use("/api/admin/auth", adminAuthRoutes);
router.use("/api/auth", userAuthRoutes);
router.use("/api/admin", adminRoutes);
router.use("/api/categories", categoryRoutes);
router.use("/api/tours", tourRoutes);
router.use("/api/custom-tour-requests", customTourRequestRoutes);
router.use("/api/reviews", reviewRoutes);
router.use("/api/upload", uploadRoutes);
router.use("/api/contact", contactRoutes);
router.use("/api/booking-settings", bookingSettingsRoutes);
router.use("/api/bookings", bookingRoutes);
router.use("/api/payments", paymentRoutes);
router.use("/api/dashboard", dashboardRoutes);

export default router;

