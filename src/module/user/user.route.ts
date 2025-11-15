import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateUserValidation
} from '../../validations/user.validation';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', validate(registerValidation), userController.register.bind(userController));
router.post('/login', validate(loginValidation), userController.login.bind(userController));
router.post('/forgot-password', validate(forgotPasswordValidation), userController.forgotPassword.bind(userController));
router.post('/reset-password', validate(resetPasswordValidation), userController.resetPassword.bind(userController));

// Protected routes (require authentication)
router.get('/profile', authenticate, userController.getProfile.bind(userController));
router.put('/profile', authenticate, validate(updateUserValidation), userController.updateUser.bind(userController));
router.put('/password', authenticate, validate(updatePasswordValidation), userController.updatePassword.bind(userController));

// User management routes
router.get('/', authenticate, userController.getUsers.bind(userController));
router.get('/:id', authenticate, userController.getUserById.bind(userController));
router.put('/:id', authenticate, validate(updateUserValidation), userController.updateUser.bind(userController));
router.delete('/:id', authenticate, userController.deleteUser.bind(userController));

export default router;
