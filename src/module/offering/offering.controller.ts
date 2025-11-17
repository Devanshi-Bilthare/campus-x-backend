import { Request, Response } from 'express';
import { OfferingService } from './offering.service';
import { authenticate } from '../../middleware/auth.middleware';

const offeringService = new OfferingService();

export class OfferingController {
  // Create a new offering
  async createOffering(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const offering = await offeringService.createOffering(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Offering created successfully',
        data: offering
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create offering',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Get all offerings with filters
  async getOfferings(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId,
        tags,
        slots,
        duration,
        limit,
        skip,
        sortBy,
        sortOrder
      } = req.query;

      const filters: any = {};

      if (userId) filters.userId = userId as string;
      if (tags) {
        filters.tags = Array.isArray(tags) ? tags : [tags];
      }
      if (slots) {
        filters.slots = Array.isArray(slots) ? slots : [slots];
      }
      if (duration) filters.duration = duration as string;
      if (limit) filters.limit = parseInt(limit as string);
      if (skip) filters.skip = parseInt(skip as string);
      if (sortBy) filters.sortBy = sortBy as 'createdAt' | 'completedCount';
      if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc';

      const offerings = await offeringService.getOfferings(filters);

      res.status(200).json({
        success: true,
        message: 'Offerings fetched successfully',
        data: offerings,
        count: offerings.length
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch offerings',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Get single offering by ID
  async getOfferingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const offering = await offeringService.getOfferingById(id);

      if (!offering) {
        res.status(404).json({
          success: false,
          message: 'Offering not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Offering fetched successfully',
        data: offering
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch offering',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Update offering
  async updateOffering(req: Request, res: Response): Promise<void> {
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

      const offering = await offeringService.updateOffering(id, userId, req.body);

      if (!offering) {
        res.status(404).json({
          success: false,
          message: 'Offering not found or you do not have permission to update it'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Offering updated successfully',
        data: offering
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update offering',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Delete offering
  async deleteOffering(req: Request, res: Response): Promise<void> {
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

      const deleted = await offeringService.deleteOffering(id, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Offering not found or you do not have permission to delete it'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Offering deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete offering',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Get offerings by current user
  async getMyOfferings(req: Request, res: Response): Promise<void> {
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
      const offerings = await offeringService.getOfferingsByUser(
        userId,
        limit ? parseInt(limit as string) : undefined,
        skip ? parseInt(skip as string) : undefined
      );

      res.status(200).json({
        success: true,
        message: 'Your offerings fetched successfully',
        data: offerings,
        count: offerings.length
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch your offerings',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}

