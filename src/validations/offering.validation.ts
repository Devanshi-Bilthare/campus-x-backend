import Joi from 'joi';

// Create offering validation
export const createOfferingValidation = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description cannot exceed 2000 characters',
    'any.required': 'Description is required'
  }),
  tags: Joi.array().items(Joi.string().trim()).min(1).required().messages({
    'array.min': 'At least one tag is required',
    'any.required': 'Tags are required'
  }),
  slots: Joi.array().items(Joi.string().trim()).min(1).required().messages({
    'array.min': 'At least one time slot is required',
    'any.required': 'Time slots are required'
  }),
  duration: Joi.string().trim().required().messages({
    'any.required': 'Duration is required'
  }),
  image: Joi.string().uri().optional()
});

// Update offering validation
export const updateOfferingValidation = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(2000).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  slots: Joi.array().items(Joi.string().trim()).optional(),
  duration: Joi.string().trim().optional(),
  image: Joi.string().uri().optional()
});

