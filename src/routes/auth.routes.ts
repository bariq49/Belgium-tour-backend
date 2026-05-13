import { Router, type IRouter } from "express";
import authController from "../controllers/auth.controller";
import { protect } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import { loginSchema, changePasswordSchema } from "../validators/auth.validator";
import rateLimit from "express-rate-limit";

const router: IRouter = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again after 15 minutes",
});

// Public routes
router.post("/login", loginLimiter, validateRequest(loginSchema), authController.login);
router.post("/refresh", authController.refresh);

// Protected routes
router.use(protect);
router.post("/logout", authController.logout);
router.post("/change-password", validateRequest(changePasswordSchema), authController.changePassword);
router.post("/logout-all", authController.logoutAllDevices);
router.get("/activities", authController.getActivities);

export default router;
