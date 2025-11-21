import Joi from 'joi';

// Registration validation
export const registerValidation = Joi.object({
  fullName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name cannot exceed 100 characters',
    'any.required': 'Full name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  username: Joi.string().min(3).max(30).required().messages({
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username cannot exceed 30 characters',
    'any.required': 'Username is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  }),
  phoneNumber: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  city: Joi.string().max(100).optional(),
  role: Joi.string().valid('student', 'teacher').required().messages({
    'any.only': 'Role must be either "student" or "teacher"',
    'any.required': 'Role is required. Please choose either "student" or "teacher"'
  })
});

// Login validation
export const loginValidation = Joi.object({
  email: Joi.string().email().optional(),
  username: Joi.string().min(3).optional(),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
}).or('email', 'username').messages({
  'object.missing': 'Either email or username is required'
});

// Update password validation
export const updatePasswordValidation = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters',
    'any.required': 'New password is required'
  })
});

// Forgot password validation
export const forgotPasswordValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});

// Reset password validation
export const resetPasswordValidation = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters',
    'any.required': 'New password is required'
  })
});

// Update user validation
export const updateUserValidation = Joi.object({
  fullName: Joi.string().min(2).max(100).optional(),
  phoneNumber: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).allow('', null).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  city: Joi.string().max(100).allow('', null).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  academics: Joi.object({
    branch: Joi.string().allow('', null).optional(),
    semester: Joi.number().min(1).max(12).empty('').optional(),
    collegeName: Joi.string().allow('', null).optional(),
    yearOfGraduation: Joi.number().min(1900).max(2100).empty('').optional(),
    yearOfJoining: Joi.number().min(1900).max(2100).empty('').optional(),
    subjects: Joi.array().items(Joi.string()).optional(),
    gpa: Joi.number().min(0).max(10).empty('').optional(),
    degree: Joi.string().allow('', null).optional(),
    yearsOfExperience: Joi.number().min(0).empty('').optional()
  }).optional(),
  skills: Joi.object({
    academic: Joi.array().items(Joi.string()).optional(),
    hobby: Joi.array().items(Joi.string()).optional(),
    other: Joi.array().items(Joi.string()).optional()
  }).optional(),
  about: Joi.string().max(1000).optional(),
  socialMedia: Joi.object({
    instagram: Joi.string().uri().optional(),
    linkedin: Joi.string().uri().optional(),
    github: Joi.string().uri().optional(),
    leetcode: Joi.string().uri().optional(),
    twitter: Joi.string().uri().optional(),
    youtube: Joi.string().uri().optional()
  }).optional(),
  profilePicture: Joi.string().uri().optional()
});

