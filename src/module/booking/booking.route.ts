import { Router } from 'express';
import { BookingController } from './booking.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  createBookingValidation,
  updateBookingValidation,
  updateBookingStatusValidation,
  cancelBookingValidation
} from '../../validations/booking.validation';

const router = Router();
const bookingController = new BookingController();

// Public routes
router.get('/', bookingController.getBookings.bind(bookingController));
router.get('/:id', bookingController.getBookingById.bind(bookingController));

// Protected routes (require authentication)
router.post('/', authenticate, validate(createBookingValidation), bookingController.createBooking.bind(bookingController));
router.put('/:id', authenticate, validate(updateBookingValidation), bookingController.updateBooking.bind(bookingController));
router.delete('/:id', authenticate, bookingController.deleteBooking.bind(bookingController));

// Booking status management (by offering owner)
router.put('/:id/status', authenticate, validate(updateBookingStatusValidation), bookingController.updateBookingStatus.bind(bookingController));

// Cancel booking (by booking owner or offering owner)
router.post('/:id/cancel', authenticate, validate(cancelBookingValidation), bookingController.cancelBooking.bind(bookingController));

// Get user's own bookings
router.get('/my/bookings', authenticate, bookingController.getMyBookings.bind(bookingController));

// Get bookings for user's offerings (as offering owner)
router.get('/my/offerings/bookings', authenticate, bookingController.getBookingsForMyOfferings.bind(bookingController));

export default router;

