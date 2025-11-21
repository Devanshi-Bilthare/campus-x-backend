import mongoose, { Schema } from 'mongoose';
import { IOffering } from '../interface/offering.interface';

// Offering Schema
const OfferingSchema = new Schema<IOffering>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  slots: [{
    type: String,
    trim: true,
    required: true
  }],
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  } as any,
  completedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  image:{
    type: String,
    trim: true
  },
  bookedSlots: [{
    slot: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Create indexes for better query performance
OfferingSchema.index({ userId: 1 });
OfferingSchema.index({ tags: 1 });
OfferingSchema.index({ createdAt: -1 });

// Create and export the model
export const Offering = mongoose.model<IOffering>('Offering', OfferingSchema);

