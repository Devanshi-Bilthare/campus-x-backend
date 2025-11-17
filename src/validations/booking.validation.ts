import Joi from 'joi';
import { BookingStatus } from '../interface/booking.interface';

// Create booking validation
export const createBookingValidation = Joi.object({
  offeringId: Joi.string().required().messages({
    'any.required': 'Offering ID is required'
  })
});

// Update booking validation
export const updateBookingValidation = Joi.object({
  status: Joi.string().valid('requested', 'approved', 'rejected', 'cancelled', 'completed').optional(),
  cancellationReason: Joi.string().max(500).allow('', null).optional()
});

// Update booking status validation (for offering owner)
export const updateBookingStatusValidation = Joi.object({
  status: Joi.string().valid('approved', 'rejected', 'completed').required().messages({
    'any.required': 'Status is required',
    'any.only': 'Status must be one of: approved, rejected, completed'
  })
});

// Cancel booking validation
export const cancelBookingValidation = Joi.object({
  cancellationReason: Joi.string().max(500).required().messages({
    'any.required': 'Cancellation reason is required',
    'string.max': 'Cancellation reason cannot exceed 500 characters'
  })
});

