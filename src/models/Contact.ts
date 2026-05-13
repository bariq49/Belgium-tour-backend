import mongoose, { Schema } from "mongoose";
import { IContact } from "../types/contact.types";


const ContactSchema: Schema = new Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        inquiryType: { type: String, required: true },
        message: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IContact>("Contact", ContactSchema);
