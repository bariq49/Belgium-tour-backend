import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const createCustomTourRequestSchema = Joi.object({
  tourId: objectId.required(),
  date: Joi.date().required(),
  durationNights: Joi.string().required(),
  adultsCount: Joi.number().integer().min(1).required(),
  adultAges: Joi.array().items(Joi.string()).optional(),
  specialRequests: Joi.string().allow("").optional(),
  budgetPerPerson: Joi.number().min(0).required(),
  budgetFlexibility: Joi.string().valid("strict", "flexible", "unlimited").required(),
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  email: Joi.string().email().trim().required(),
  phone: Joi.string().trim().required(),
});

export const updateCustomTourRequestSchema = Joi.object({
  status: Joi.string().valid("pending", "contacted", "booked", "cancelled"),
  tourId: objectId,
  date: Joi.date(),
  durationNights: Joi.string(),
  adultsCount: Joi.number().integer().min(1),
  adultAges: Joi.array().items(Joi.string()),
  specialRequests: Joi.string().allow(""),
  budgetPerPerson: Joi.number().min(0),
  budgetFlexibility: Joi.string().valid("strict", "flexible", "unlimited"),
  firstName: Joi.string().trim(),
  lastName: Joi.string().trim(),
  email: Joi.string().email().trim(),
  phone: Joi.string().trim(),
}).min(1);

export const bulkDeleteCustomTourRequestsSchema = Joi.object({
  ids: Joi.array().items(objectId.required()).min(1).required(),
});
