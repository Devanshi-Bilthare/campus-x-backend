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

// Protected routes (require authentication)
// Bookings I made
router.get('/my/bookings', authenticate, bookingController.getMyBookings.bind(bookingController)); // Approved bookings I made
router.get('/my/pending', authenticate, bookingController.getMyPendingBookings.bind(bookingController)); // Pending bookings I made
router.get('/my/rejected', authenticate, bookingController.getMyRejectedBookings.bind(bookingController)); // Rejected bookings I made
router.get('/my/completed', authenticate, bookingController.getMyCompletedBookings.bind(bookingController)); // Completed bookings I made

// Bookings for my offerings (as offering owner)
router.get('/my/offerings/bookings', authenticate, bookingController.getBookingsForMyOfferings.bind(bookingController));
router.get('/received', authenticate, bookingController.getReceivedBookings.bind(bookingController)); // Approved/completed bookings for my offerings
router.get('/pending', authenticate, bookingController.getPendingBookings.bind(bookingController)); // Pending requests for my offerings
router.get('/rejected', authenticate, bookingController.getRejectedBookings.bind(bookingController)); // Rejected bookings for my offerings
router.get('/completed', authenticate, bookingController.getCompletedBookings.bind(bookingController)); // Completed bookings for my offerings
router.post('/', authenticate, validate(createBookingValidation), bookingController.createBooking.bind(bookingController));
router.put('/:id', authenticate, validate(updateBookingValidation), bookingController.updateBooking.bind(bookingController));
router.delete('/:id', authenticate, bookingController.deleteBooking.bind(bookingController));

// Booking status management (by offering owner)
router.put('/:id/status', authenticate, validate(updateBookingStatusValidation), bookingController.updateBookingStatus.bind(bookingController));

// Cancel booking (by booking owner or offering owner)
router.post('/:id/cancel', authenticate, validate(cancelBookingValidation), bookingController.cancelBooking.bind(bookingController));

// Get booking requests (pending requests for user's offerings)
router.get('/my/offerings/requests', authenticate, bookingController.getBookingRequests.bind(bookingController));

// Get booked sessions (approved/completed bookings for user's offerings)
router.get('/my/offerings/sessions', authenticate, bookingController.getBookedSessions.bind(bookingController));

// This should remain last to avoid conflicts
router.get('/:id', bookingController.getBookingById.bind(bookingController));

export default router;

