import { Router, type IRouter } from "express";
import userAuthController from "../controllers/userAuth.controller";
import { protectUser } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import { loginSchema, changePasswordSchema } from "../validators/auth.validator";
import { userRegisterSchema } from "../validators/user-auth.validator";
import rateLimit from "express-rate-limit";

const router: IRouter = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again after 15 minutes",
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many registration attempts, please try again later",
});

router.post("/register", registerLimiter, validateRequest(userRegisterSchema), userAuthController.register);
router.post("/login", loginLimiter, validateRequest(loginSchema), userAuthController.login);
router.post("/refresh", userAuthController.refresh);
router.post("/forgot-password", userAuthController.forgotPassword);
router.post("/reset-password", userAuthController.resetPassword);

router.use(protectUser);
router.post("/logout", userAuthController.logout);
router.post("/change-password", validateRequest(changePasswordSchema), userAuthController.changePassword);
router.post("/logout-all", userAuthController.logoutAllDevices);
router.get("/activities", userAuthController.getActivities);
router.get("/me", userAuthController.getMe);
router.post("/update-profile", userAuthController.updateProfile);

export default router;
