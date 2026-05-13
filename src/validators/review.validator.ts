import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const createReviewSchema = Joi.object({
  tourId: objectId.required(),
  authorName: Joi.string().trim().min(1).max(120).required(),
  authorEmail: Joi.string().trim().max(254).allow("", null).optional(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().min(1).max(2000).required(),
});

export const updateReviewStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "approved", "rejected").required(),
});
