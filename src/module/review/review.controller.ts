import { Request, Response } from 'express';
import { ReviewService } from './review.service';
import { IReviewCreation, IReviewUpdate } from '../../interface/review.interface';

const reviewService = new ReviewService();

export class ReviewController {
  // Create a new review
  async createReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const reviewData: IReviewCreation = req.body;
      const review = await reviewService.createReview(userId, reviewData);

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create review',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Get all reviews with filters
  async getReviews(req: Request, res: Response): Promise<void> {
    try {
      const { profileId, userId, rating, limit, skip } = req.query;

      const filters: any = {};

      if (profileId) filters.profileId = profileId as string;
      if (userId) filters.userId = userId as string;
      if (rating) filters.rating = parseInt(rating as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (skip) filters.skip = parseInt(skip as string);

      const reviews = await reviewService.getReviews(filters);

      res.status(200).json({
        success: true,
        message: 'Reviews fetched successfully',
        data: reviews,
        count: reviews.length
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch reviews',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Get single review by ID
  async getReviewById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const review = await reviewService.getReviewById(id);

      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Review not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Review fetched successfully',
        data: review
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch review',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Get reviews for a specific profile (teacher)
  async getReviewsByProfile(req: Request, res: Response): Promise<void> {
    try {
      const { profileId } = req.params;
      const { limit, skip } = req.query;

      const reviews = await reviewService.getReviewsByProfile(
        profileId,
        limit ? parseInt(limit as string) : undefined,
        skip ? parseInt(skip as string) : undefined
      );

      const averageRating = await reviewService.getAverageRating(profileId);

      res.status(200).json({
        success: true,
        message: 'Reviews fetched successfully',
        data: {
          reviews,
          averageRating: averageRating.average,
          totalReviews: averageRating.total
        },
        count: reviews.length
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch reviews',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Get reviews written by current user
  async getMyReviews(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const { limit, skip } = req.query;
      const reviews = await reviewService.getReviewsByUser(
        userId,
        limit ? parseInt(limit as string) : undefined,
        skip ? parseInt(skip as string) : undefined
      );

      res.status(200).json({
        success: true,
        message: 'Your reviews fetched successfully',
        data: reviews,
        count: reviews.length
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch your reviews',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Update review
  async updateReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const updateData: IReviewUpdate = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const review = await reviewService.updateReview(id, userId, updateData);

      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Review not found or you do not have permission to update it'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: review
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update review',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Delete review
  async deleteReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const deleted = await reviewService.deleteReview(id, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Review not found or you do not have permission to delete it'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete review',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}

