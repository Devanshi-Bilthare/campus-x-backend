import { Booking } from '../../models/booking.model';
import { Offering } from '../../models/offering.model';
import { User } from '../../models/user.model';
import { IBooking, IBookingCreation, IBookingUpdate, BookingStatus } from '../../interface/booking.interface';

export class BookingService {
  // Create a new booking
  async createBooking(userId: string, bookingData: IBookingCreation): Promise<IBooking> {
    // Check if offering exists
    const offering = await Offering.findById(bookingData.offeringId);
    if (!offering) {
      throw new Error('Offering not found');
    }

    // Check if user is trying to book their own offering
    if (offering.userId.toString() === userId) {
      throw new Error('You cannot book your own offering');
    }

    // Validate that the selected slot exists in the offering's slots
    if (!offering.slots.includes(bookingData.slot)) {
      throw new Error('Selected time slot is not available for this offering');
    }

    // Check if user already has a pending/approved booking for this offering and slot
    const existingUserBooking = await Booking.findOne({
      userId,
      offeringId: bookingData.offeringId,
      slot: bookingData.slot,
      status: { $in: ['requested', 'approved'] }
    });

    if (existingUserBooking) {
      throw new Error('You already have a pending or approved booking for this offering at this time slot');
    }

    // Check if this slot is already booked by someone else (prevent double-booking)
    const existingSlotBooking = await Booking.findOne({
      offeringId: bookingData.offeringId,
      slot: bookingData.slot,
      status: { $in: ['requested', 'approved'] }
    });

    if (existingSlotBooking) {
      throw new Error('This time slot is already booked by another user');
    }

    // Create and save the booking with the selected slot
    const booking = new Booking({
      userId, // User who is booking
      offeringId: bookingData.offeringId,
      offeringOwnerId: offering.userId, // User who created the offering
      slot: bookingData.slot, // Store the selected slot from the offering
      status: 'requested'
    });

    return await booking.save();
  }

  // Get booking by ID
  async getBookingById(bookingId: string): Promise<IBooking | null> {
    return await Booking.findById(bookingId)
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('cancelledBy', 'fullName email username');
  }

  // Get all bookings with filters
  async getBookings(filters: {
    userId?: string;
    offeringId?: string;
    status?: BookingStatus;
    limit?: number;
    skip?: number;
  }): Promise<IBooking[]> {
    const query: any = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.offeringId) {
      query.offeringId = filters.offeringId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    return await Booking.find(query)
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('offeringOwnerId', 'fullName email username profilePicture')
      .populate('cancelledBy', 'fullName email username')
      .limit(filters.limit || 50)
      .skip(filters.skip || 0)
      .sort({ createdAt: -1 });
  }

  // Update booking (by booking owner)
  async updateBooking(bookingId: string, userId: string, updateData: IBookingUpdate): Promise<IBooking | null> {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Only the user who created the booking can update it (unless it's status change by offering owner)
    if (booking.userId.toString() !== userId) {
      throw new Error('You do not have permission to update this booking');
    }

    // If cancelling, set cancelledBy
    const updatePayload: any = { ...updateData };
    if (updateData.status === 'cancelled') {
      updatePayload.cancelledBy = userId;
    }

    return await Booking.findByIdAndUpdate(
      bookingId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    )
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('cancelledBy', 'fullName email username');
  }

  // Update booking status (by offering owner)
  async updateBookingStatus(
    bookingId: string,
    offeringOwnerId: string,
    status: 'approved' | 'rejected' | 'completed'
  ): Promise<IBooking | null> {
    const booking = await Booking.findById(bookingId).populate('offeringId');

    if (!booking) {
      throw new Error('Booking not found');
    }

    const offering = booking.offeringId as any;

    // Verify that the user owns the offering
    if (offering.userId.toString() !== offeringOwnerId) {
      throw new Error('You do not have permission to update this booking');
    }

    // If completing, increment the offering's completed count and give coins to the user who booked
    if (status === 'completed') {
      await Offering.findByIdAndUpdate(offering._id, { $inc: { completedCount: 1 } });
      // Add 300 coins to the user who booked
      await User.findByIdAndUpdate(booking.userId, { $inc: { coins: 300 } });
    }

    return await Booking.findByIdAndUpdate(
      bookingId,
      { $set: { status } },
      { new: true, runValidators: true }
    )
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('cancelledBy', 'fullName email username');
  }

  // Cancel booking (by booking owner or offering owner)
  async cancelBooking(
    bookingId: string,
    userId: string,
    cancellationReason: string
  ): Promise<IBooking | null> {
    const booking = await Booking.findById(bookingId).populate('offeringId');

    if (!booking) {
      throw new Error('Booking not found');
    }

    const offering = booking.offeringId as any;

    // Check if user is either the booking owner or offering owner
    const isBookingOwner = booking.userId.toString() === userId;
    const isOfferingOwner = offering.userId.toString() === userId;

    if (!isBookingOwner && !isOfferingOwner) {
      throw new Error('You do not have permission to cancel this booking');
    }

    // If booking was approved before cancellation, deduct 100 coins from the user who cancels
    if (booking.status === 'approved') {
      // Ensure coins don't go below 0
      const user = await User.findById(userId);
      if (user && user.coins >= 100) {
        await User.findByIdAndUpdate(userId, { $inc: { coins: -100 } });
      } else if (user) {
        // If user has less than 100 coins, set to 0
        await User.findByIdAndUpdate(userId, { $set: { coins: 0 } });
      }
    }

    return await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          status: 'cancelled',
          cancelledBy: userId,
          cancellationReason
        }
      },
      { new: true, runValidators: true }
    )
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('cancelledBy', 'fullName email username');
  }

  // Delete booking
  async deleteBooking(bookingId: string, userId: string): Promise<boolean> {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Only the user who created the booking can delete it
    if (booking.userId.toString() !== userId) {
      throw new Error('You do not have permission to delete this booking');
    }

    const result = await Booking.findByIdAndDelete(bookingId);
    return result !== null;
  }

  // Get bookings by user (bookings I made)
  async getBookingsByUser(userId: string, limit?: number, skip?: number): Promise<IBooking[]> {
    return await Booking.find({ userId })
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('cancelledBy', 'fullName email username')
      .limit(limit || 50)
      .skip(skip || 0)
      .sort({ createdAt: -1 });
  }

  // Get my pending bookings (bookings I made that are still requested)
  async getMyPendingBookings(userId: string, limit?: number, skip?: number): Promise<IBooking[]> {
    return await Booking.find({
      userId,
      status: 'requested'
    })
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('offeringOwnerId', 'fullName email username profilePicture')
      .limit(limit || 50)
      .skip(skip || 0)
      .sort({ createdAt: -1 });
  }

  // Get my approved bookings (bookings I made that are approved)
  async getMyApprovedBookings(userId: string, limit?: number, skip?: number): Promise<IBooking[]> {
    return await Booking.find({
      userId,
      status: 'approved'
    })
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('offeringOwnerId', 'fullName email username profilePicture')
      .limit(limit || 50)
      .skip(skip || 0)
      .sort({ createdAt: -1 });
  }

  // Get my rejected bookings (bookings I made that were rejected)
  async getMyRejectedBookings(userId: string, limit?: number, skip?: number): Promise<IBooking[]> {
    return await Booking.find({
      userId,
      status: 'rejected'
    })
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('offeringOwnerId', 'fullName email username profilePicture')
      .limit(limit || 50)
      .skip(skip || 0)
      .sort({ createdAt: -1 });
  }

  // Get my completed bookings (bookings I made that are completed)
  async getMyCompletedBookings(userId: string, limit?: number, skip?: number): Promise<IBooking[]> {
    return await Booking.find({
      userId,
      status: 'completed'
    })
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('offeringOwnerId', 'fullName email username profilePicture')
      .limit(limit || 50)
      .skip(skip || 0)
      .sort({ createdAt: -1 });
  }

  // Get bookings for user's offerings (as offering owner)
  async getBookingsForMyOfferings(userId: string, limit?: number, skip?: number): Promise<IBooking[]> {
    // Find all offerings by this user
    const offerings = await Offering.find({ userId });
    const offeringIds = offerings.map(offering => offering._id);

    return await Booking.find({ offeringId: { $in: offeringIds } })
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('offeringOwnerId', 'fullName email username profilePicture')
      .populate('cancelledBy', 'fullName email username')
      .limit(limit || 50)
      .skip(skip || 0)
      .sort({ createdAt: -1 });
  }

  // Get pending booking requests for user's offerings (status: requested)
  async getBookingRequests(userId: string, limit?: number, skip?: number): Promise<IBooking[]> {
    // Find all offerings by this user
    const offerings = await Offering.find({ userId });
    const offeringIds = offerings.map(offering => offering._id);

    return await Booking.find({
      offeringId: { $in: offeringIds },
      status: 'requested'
    })
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('offeringOwnerId', 'fullName email username profilePicture')
      .limit(limit || 50)
      .skip(skip || 0)
      .sort({ createdAt: -1 });
  }

  // Get approved bookings (booked sessions) for user's offerings
  async getBookedSessions(userId: string, limit?: number, skip?: number): Promise<IBooking[]> {
    // Find all offerings by this user
    const offerings = await Offering.find({ userId });
    const offeringIds = offerings.map(offering => offering._id);

    return await Booking.find({
      offeringId: { $in: offeringIds },
      status: { $in: ['approved', 'completed'] }
    })
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('offeringOwnerId', 'fullName email username profilePicture')
      .limit(limit || 50)
      .skip(skip || 0)
      .sort({ createdAt: -1 });
  }

  // Get received bookings (booked sessions received by user for their offerings)
  async getReceivedBookings(userId: string, limit?: number, skip?: number): Promise<IBooking[]> {
    // Find all offerings by this user
    const offerings = await Offering.find({ userId });
    const offeringIds = offerings.map(offering => offering._id);

    return await Booking.find({
      offeringId: { $in: offeringIds },
      status: { $in: ['approved', 'completed'] }
    })
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('offeringOwnerId', 'fullName email username profilePicture')
      .limit(limit || 50)
      .skip(skip || 0)
      .sort({ createdAt: -1 });
  }

  // Get pending bookings for user's offerings
  async getPendingBookings(userId: string, limit?: number, skip?: number): Promise<IBooking[]> {
    // Find all offerings by this user
    const offerings = await Offering.find({ userId });
    const offeringIds = offerings.map(offering => offering._id);

    return await Booking.find({
      offeringId: { $in: offeringIds },
      status: 'requested'
    })
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('offeringOwnerId', 'fullName email username profilePicture')
      .limit(limit || 50)
      .skip(skip || 0)
      .sort({ createdAt: -1 });
  }

  // Get completed bookings for user's offerings
  async getCompletedBookings(userId: string, limit?: number, skip?: number): Promise<IBooking[]> {
    // Find all offerings by this user
    const offerings = await Offering.find({ userId });
    const offeringIds = offerings.map(offering => offering._id);

    return await Booking.find({
      offeringId: { $in: offeringIds },
      status: 'completed'
    })
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('offeringOwnerId', 'fullName email username profilePicture')
      .limit(limit || 50)
      .skip(skip || 0)
      .sort({ createdAt: -1 });
  }

  // Get rejected bookings for user's offerings (bookings I rejected)
  async getRejectedBookingsForOfferings(userId: string, limit?: number, skip?: number): Promise<IBooking[]> {
    // Find all offerings by this user
    const offerings = await Offering.find({ userId });
    const offeringIds = offerings.map(offering => offering._id);

    return await Booking.find({
      offeringId: { $in: offeringIds },
      status: 'rejected'
    })
      .populate('userId', 'fullName email username profilePicture')
      .populate('offeringId')
      .populate('offeringOwnerId', 'fullName email username profilePicture')
      .limit(limit || 50)
      .skip(skip || 0)
      .sort({ createdAt: -1 });
  }
}

