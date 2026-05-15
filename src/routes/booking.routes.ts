import { Router, type IRouter } from "express";
import bookingController from "../controllers/booking.controller";

const router: IRouter = Router();

router.post("/", bookingController.createBooking);
router.get("/", bookingController.getBookings);
router.get("/my-bookings", bookingController.getMyBookings);
router.get("/:orderNumber/receipt", bookingController.getReceipt);
router.get("/:orderNumber", bookingController.getBooking);
router.delete("/bulk-delete", bookingController.bulkDeleteBookings);
router.delete("/:id", bookingController.deleteBooking);

export default router;
