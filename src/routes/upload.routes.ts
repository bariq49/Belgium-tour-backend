import { Router, type IRouter } from "express";
import uploadController from "../controllers/upload.controller";
import { uploadSingle } from "../middleware/upload";

const router: IRouter = Router();
router.post("/upload", uploadSingle("file"), uploadController.uploadImage);

export default router;

