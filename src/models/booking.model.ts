import mongoose, { Schema } from 'mongoose';
import { IBooking } from '../interface/booking.interface';

// Booking Schema
const BookingSchema = new Schema<IBooking>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  } as any,
  offeringId: {
    type: Schema.Types.ObjectId,
    ref: 'Offering',
    required: [true, 'Offering ID is required']
  } as any,
  slot: {
    type: String,
    trim: true,
    required: [true, 'Time slot is required']
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'requested',
    required: true
  },
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  } as any,
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
BookingSchema.index({ userId: 1 });
BookingSchema.index({ offeringId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ createdAt: -1 });

// Validation: If status is cancelled, cancellationReason should be provided
BookingSchema.pre('save', function(next) {
  const booking = this as any;
  if (booking.status === 'cancelled' && !booking.cancellationReason) {
    return next(new Error('Cancellation reason is required when status is cancelled'));
  }
  next();
});

// Create and export the model
export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

