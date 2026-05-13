import { Router, type IRouter } from "express";
import BookingSettingsController from "../controllers/booking-settings.controller";
import { protect } from "../middleware/auth";

const router: IRouter = Router();

// All settings routes are protected


router.get("/", BookingSettingsController.getSettings);
router.use(protect);
router.patch("/", BookingSettingsController.updateSettings);

export default router;
