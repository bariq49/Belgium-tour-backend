import { Router, type IRouter } from "express";
import adminController from "../controllers/admin.controller";
import { protect } from "../middleware/auth";

const router: IRouter = Router();

router.use(protect);

router.get("/me/overview", adminController.getOverview);

export default router;
