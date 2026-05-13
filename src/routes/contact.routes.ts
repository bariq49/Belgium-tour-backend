import { Router, type IRouter } from "express";
import contactController from "../controllers/contact.controller";
const router: IRouter = Router();

router.post("/", contactController.submitContactForm);

export default router;
