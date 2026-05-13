import { Router, type IRouter } from "express";
import paymentController from "../controllers/payment.controller";

const router: IRouter = Router();

router.post("/create-checkout-session", paymentController.createCheckoutSession);
router.get("/", paymentController.getPayments);
router.get("/:orderNumber", paymentController.getPaymentDetails);
router.delete("/bulk", paymentController.bulkDeletePayments);
router.delete("/:id", paymentController.deletePayment);

export default router;
