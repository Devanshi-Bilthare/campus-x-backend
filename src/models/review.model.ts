import mongoose, { Schema } from 'mongoose';
import { IReview } from '../interface/review.interface';

// Review Schema
const ReviewSchema = new Schema<IReview>({
  profileId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Profile ID is required']
  } as any,
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  } as any,
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  message: {
    type: String,
    required: [true, 'Review message is required'],
    trim: true,
    minlength: [10, 'Review message must be at least 10 characters'],
    maxlength: [1000, 'Review message cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
ReviewSchema.index({ profileId: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ profileId: 1, userId: 1 }, { unique: true }); // Prevent duplicate reviews from same user for same profile
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ rating: 1 });

// Create and export the model
export const Review = mongoose.model<IReview>('Review', ReviewSchema);

