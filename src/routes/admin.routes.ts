import { Router, type IRouter } from "express";
import adminController from "../controllers/admin.controller";
import { protect } from "../middleware/auth";

const router: IRouter = Router();

router.use(protect);

router.get("/me", adminController.getMe);
router.get("/overview", adminController.getOverview);
router.get("/partners", adminController.getPartners);
router.get("/partners/:userId", adminController.getPartner);
router.patch("/update-profile", adminController.updateProfile);
router.patch("/update-password", adminController.changePassword);
router.patch("/partners/:userId", adminController.updatePartner);
router.delete("/partners/:userId", adminController.deletePartner);

export default router;
