import { Request, Response } from 'express';
import { UserService } from './user.service';
import { IUserRegistration, IUserUpdate } from '../../interface/user.interface';

const userService = new UserService();

export class UserController {
  // Register a new user
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: IUserRegistration = req.body;
      
      // Check if user already exists
      const existingUserByEmail = await userService.getUserByEmail(userData.email);
      const existingUserByUsername = await userService.getUserByUsername(userData.username);
      
      if (existingUserByEmail) {
        res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
        return;
      }

      if (existingUserByUsername) {
        res.status(400).json({
          success: false,
          message: 'User with this username already exists'
        });
        return;
      }

      const user = await userService.createUser(userData);
      
      // Generate token for newly registered user
      const token = userService.generateToken({
        userId: (user._id as any).toString(),
        email: user.email,
        role: user.role
      });
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          token
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to register user',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Login user
  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData = req.body;

      const result = await userService.loginUser(loginData);

      if (!result) {
        res.status(401).json({
          success: false,
          message: 'Invalid email/username or password'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get current user profile
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const user = await userService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get all users
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { role, city, isActive, limit, skip } = req.query;

      const filters = {
        role: role as 'student' | 'teacher' | undefined,
        city: city as string | undefined,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        skip: skip ? parseInt(skip as string) : undefined
      };

      const users = await userService.getUsers(filters);

      res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update user
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: IUserUpdate = req.body;

      // Check if user is updating their own profile or is admin
      const userId = req.user?.userId;
      if (userId !== id) {
        res.status(403).json({
          success: false,
          message: 'You can only update your own profile'
        });
        return;
      }

      const user = await userService.updateUser(id, updateData);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update user',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Update password
  async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const passwordData = req.body;
      await userService.updatePassword(userId, passwordData);

      res.status(200).json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update password',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Forgot password
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await userService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent to your email.'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to process forgot password request',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Reset password
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      await userService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully. Please login with your new password.'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to reset password',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Delete user
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      // Check if user is deleting their own account or is admin
      if (userId !== id) {
        res.status(403).json({
          success: false,
          message: 'You can only delete your own account'
        });
        return;
      }

      const user = await userService.deleteUser(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}
