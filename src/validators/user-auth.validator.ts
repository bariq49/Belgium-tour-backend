import Joi from "joi";

const allowedRoles = ["traveler", "travel_agency", "dmc", "hotel_partner"];

export const userRegisterSchema = Joi.object({
  firstName: Joi.string().trim().min(1).required().messages({
    "any.required": "First name is required",
  }),
  lastName: Joi.string().trim().min(1).required().messages({
    "any.required": "Last name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).optional().messages({
    "string.min": "Password must be at least 8 characters",
  }),
  phoneNumber: Joi.string().trim().optional().allow(""),
  phone: Joi.string().trim().optional().allow(""),
  companyName: Joi.string().trim().optional().allow(""),
  businessProfile: Joi.string().trim().optional().allow(""),
  businessEmail: Joi.string().email().optional().allow(""),
  role: Joi.string()
    .valid(...allowedRoles)
    .optional()
    .messages({
      "any.only": "Invalid role",
    }),
});
