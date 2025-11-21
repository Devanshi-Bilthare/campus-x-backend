import { Document, Types } from 'mongoose';

// Review Interface
export interface IReview extends Document {
  profileId: Types.ObjectId; // Reference to the teacher/user profile being reviewed
  userId: Types.ObjectId; // Reference to the user who wrote the review
  rating: number; // Rating from 1 to 5
  message: string; // Review message/text
  createdAt: Date;
  updatedAt: Date;
}

// Review Creation DTO
export interface IReviewCreation {
  profileId: string; // Teacher's user ID
  rating: number; // Rating from 1 to 5
  message: string; // Review message
}

// Review Update DTO
export interface IReviewUpdate {
  rating?: number; // Rating from 1 to 5
  message?: string; // Review message
}

