import { Document } from "mongoose";

export interface IContact extends Document {
    fullName: string;
    email: string;
    phone?: string;
    inquiryType: string;
    message: string;
    createdAt: Date;
    updatedAt: Date;
}
