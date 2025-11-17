import { Request, Response } from 'express';
import { BookingService } from './booking.service';
import { BookingStatus } from '../../interface/booking.interface';

const bookingService = new BookingService();

export class BookingController {
  // Create a new booking
  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const booking = await bookingService.createBooking(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create booking',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Get all bookings with filters
  async getBookings(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId,
        offeringId,
        status,
        limit,
        skip
      } = req.query;

      const filters: any = {};

      if (userId) filters.userId = userId as string;
      if (offeringId) filters.offeringId = offeringId as string;
      if (status) filters.status = status as BookingStatus;
      if (limit) filters.limit = parseInt(limit as string);
      if (skip) filters.skip = parseInt(skip as string);

      const bookings = await bookingService.getBookings(filters);

      res.status(200).json({
        success: true,
        message: 'Bookings fetched successfully',
        data: bookings,
        count: bookings.length
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch bookings',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Get single booking by ID
  async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const booking = await bookingService.getBookingById(id);

      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Booking fetched successfully',
        data: booking
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch booking',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Update booking (by booking owner)
  async updateBooking(req: Request, res: Response): Promise<void> {
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

      const booking = await bookingService.updateBooking(id, userId, req.body);

      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found or you do not have permission to update it'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Booking updated successfully',
        data: booking
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update booking',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Update booking status (by offering owner)
  async updateBookingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const { status } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      if (!['approved', 'rejected', 'completed'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: approved, rejected, completed'
        });
        return;
      }

      const booking = await bookingService.updateBookingStatus(id, userId, status);

      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found or you do not have permission to update it'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Booking status updated successfully',
        data: booking
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update booking status',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Cancel booking
  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const { cancellationReason } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      if (!cancellationReason) {
        res.status(400).json({
          success: false,
          message: 'Cancellation reason is required'
        });
        return;
      }

      const booking = await bookingService.cancelBooking(id, userId, cancellationReason);

      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found or you do not have permission to cancel it'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to cancel booking',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Delete booking
  async deleteBooking(req: Request, res: Response): Promise<void> {
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

      const deleted = await bookingService.deleteBooking(id, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Booking not found or you do not have permission to delete it'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Booking deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete booking',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Get my bookings (bookings I made)
  async getMyBookings(req: Request, res: Response): Promise<void> {
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
      const bookings = await bookingService.getBookingsByUser(
        userId,
        limit ? parseInt(limit as string) : undefined,
        skip ? parseInt(skip as string) : undefined
      );

      res.status(200).json({
        success: true,
        message: 'Your bookings fetched successfully',
        data: bookings,
        count: bookings.length
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch your bookings',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Get bookings for my offerings (as offering owner)
  async getBookingsForMyOfferings(req: Request, res: Response): Promise<void> {
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
      const bookings = await bookingService.getBookingsForMyOfferings(
        userId,
        limit ? parseInt(limit as string) : undefined,
        skip ? parseInt(skip as string) : undefined
      );

      res.status(200).json({
        success: true,
        message: 'Bookings for your offerings fetched successfully',
        data: bookings,
        count: bookings.length
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch bookings for your offerings',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}

