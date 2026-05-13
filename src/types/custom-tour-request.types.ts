import { Document, Types } from "mongoose";

export interface ICustomTourRequest extends Document {
  requestNumber: string;
  // Step 1: Selection
  tourId: Types.ObjectId;
  
  // Step 2: Logistics
  date: Date;
  durationNights: string;
  adultsCount: number;
  adultAges: string[];
  
  // Step 3: Personalization
  specialRequests: string;
  
  // Step 4: Budget
  budgetPerPerson: number;
  budgetFlexibility: "strict" | "flexible" | "unlimited";
  
  // Step 5: Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Status & Metadata
  status: "pending" | "contacted" | "booked" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomTourRequestInput {
  tourId: string;
  date: string | Date;
  durationNights: string;
  adultsCount: number;
  adultAges?: string[];
  specialRequests?: string;
  budgetPerPerson: number;
  budgetFlexibility: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export type UpdateCustomTourRequestInput = Partial<CreateCustomTourRequestInput> & {
  status?: ICustomTourRequest["status"];
};
