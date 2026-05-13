import { Router, type IRouter } from "express";
import adminController from "../controllers/admin.controller";
import { protect } from "../middleware/auth";

const router: IRouter = Router();

router.use(protect);

router.get("/me", adminController.getMe);
router.get("/overview", adminController.getOverview);
router.patch("/update-profile", adminController.updateProfile);
router.patch("/update-password", adminController.changePassword);

export default router;
