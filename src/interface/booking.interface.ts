import { Document, Types } from 'mongoose';

// Booking Status Enum
export type BookingStatus = 'requested' | 'approved' | 'rejected' | 'cancelled' | 'completed';

// Booking Interface
export interface IBooking extends Document {
  userId: Types.ObjectId; // Reference to the user who is booking
  offeringId: Types.ObjectId; // Reference to the offering
  status: BookingStatus;
  cancelledBy?: Types.ObjectId; // Reference to the user who cancelled (if cancelled)
  cancellationReason?: string; // Reason for cancellation
  createdAt: Date;
  updatedAt: Date;
}

// Booking Creation DTO
export interface IBookingCreation {
  offeringId: string;
}

// Booking Update DTO
export interface IBookingUpdate {
  status?: BookingStatus;
  cancellationReason?: string;
}

