import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).required(),
  description: Joi.string().trim().max(2000).allow("", null),
  image: Joi.string().trim().max(2048).allow("", null),
  sortOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
  metaTitle: Joi.string().trim().max(70).allow("", null),
  metaDescription: Joi.string().trim().max(160).allow("", null),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(120),
  description: Joi.string().trim().max(2000).allow("", null),
  image: Joi.string().trim().max(2048).allow("", null),
  sortOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
  metaTitle: Joi.string().trim().max(70).allow("", null),
  metaDescription: Joi.string().trim().max(160).allow("", null),
}).min(1);

export const bulkDeleteCategoriesSchema = Joi.object({
  ids: Joi.array().items(objectId.required()).min(1).required(),
});
