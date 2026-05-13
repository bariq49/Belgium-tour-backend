import Joi from "joi";

const objectId = Joi.string().hex().length(24);

const galleryItem = Joi.string().trim().max(2048);

const highlightItem = Joi.string().trim().min(1).max(500);

const itineraryStepSchema = Joi.object({
  title: Joi.string().trim().min(1).max(300).required(),
  description: Joi.string().trim().max(10000).allow("").optional(),
});

export const createTourSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  categoryId: objectId.required(),
  location: Joi.string().trim().min(1).max(120).required(),
  duration: Joi.string().trim().min(1).max(80).required(),
  summary: Joi.string().trim().min(1).max(600).required(),
  description: Joi.string().trim().min(1).max(20000).required(),
  coverImage: Joi.string().trim().min(1).max(2048).required(),
  galleryImages: Joi.array().items(galleryItem).max(30).optional(),
  price: Joi.number().min(0).required(),
  itinerarySteps: Joi.array().items(itineraryStepSchema).max(40).optional(),
  highlights: Joi.array().items(highlightItem).max(40).optional(),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
});

export const updateTourSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  categoryId: objectId,
  location: Joi.string().trim().min(1).max(120),
  duration: Joi.string().trim().min(1).max(80),
  summary: Joi.string().trim().min(1).max(600),
  description: Joi.string().trim().min(1).max(20000),
  coverImage: Joi.string().trim().min(1).max(2048),
  galleryImages: Joi.array().items(galleryItem).max(30),
  price: Joi.number().min(0),
  itinerarySteps: Joi.array().items(itineraryStepSchema).max(40),
  highlights: Joi.array().items(highlightItem).max(40),
  isActive: Joi.boolean(),
  sortOrder: Joi.number().integer().min(0),
}).min(1);

export const bulkDeleteToursSchema = Joi.object({
  ids: Joi.array().items(objectId.required()).min(1).required(),
});
