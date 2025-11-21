import Joi from 'joi';

// Create review validation
export const createReviewValidation = Joi.object({
  profileId: Joi.string().required().messages({
    'any.required': 'Profile ID is required'
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'any.required': 'Rating is required',
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
    'number.integer': 'Rating must be an integer'
  }),
  message: Joi.string().trim().min(10).max(1000).required().messages({
    'any.required': 'Review message is required',
    'string.min': 'Review message must be at least 10 characters',
    'string.max': 'Review message cannot exceed 1000 characters'
  })
});

// Update review validation
export const updateReviewValidation = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
    'number.integer': 'Rating must be an integer'
  }),
  message: Joi.string().trim().min(10).max(1000).optional().messages({
    'string.min': 'Review message must be at least 10 characters',
    'string.max': 'Review message cannot exceed 1000 characters'
  })
}).or('rating', 'message').messages({
  'object.missing': 'At least one field (rating or message) must be provided'
});

