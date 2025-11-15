import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IJWTPayload } from '../interface/user.interface';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: IJWTPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a token.'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        message: 'JWT secret not configured'
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as IJWTPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
      return;
    }
    
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Optional: Role-based authorization middleware
export const authorize = (...roles: ('student' | 'teacher')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
      return;
    }

    next();
  };
};

