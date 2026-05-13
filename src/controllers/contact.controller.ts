import { Request, Response } from "express";
import contactService from "../services/contact.service";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess } from "../utils/response";

class ContactController {
    submitContactForm = asyncHandler(async (req: Request, res: Response) => {
        const contact = await contactService.submitContactForm(req.body);
        return sendSuccess(res, contact, { message: "The message has been sent successfully" });
    });
}

export default new ContactController();
