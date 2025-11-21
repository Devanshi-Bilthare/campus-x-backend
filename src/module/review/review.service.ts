import { Review } from '../../models/review.model';
import { User } from '../../models/user.model';
import { IReview, IReviewCreation, IReviewUpdate } from '../../interface/review.interface';

export class ReviewService {
  // Create a new review
  async createReview(userId: string, reviewData: IReviewCreation): Promise<IReview> {
    // Check if the profile being reviewed exists
    const profile = await User.findById(reviewData.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Check if the profile is a teacher
    if (profile.role !== 'teacher') {
      throw new Error('Reviews can only be written for teachers');
    }

    // Check if user is trying to review themselves
    if (profile._id.toString() === userId) {
      throw new Error('You cannot write a review for yourself');
    }

    // Check if user has already reviewed this profile
    const existingReview = await Review.findOne({
      profileId: reviewData.profileId,
      userId: userId
    });

    if (existingReview) {
      throw new Error('You have already reviewed this profile');
    }

    // Create and save the review
    const review = new Review({
      profileId: reviewData.profileId,
      userId: userId,
      rating: reviewData.rating,
      message: reviewData.message
    });

    const savedReview = await review.save();

    // Update teacher's rating and totalRatings
    await this.updateTeacherRating(reviewData.profileId);

    return savedReview;
  }

  // Get review by ID
  async getReviewById(reviewId: string): Promise<IReview | null> {
    return await Review.findById(reviewId)
      .populate('profileId', 'fullName email username profilePicture role')
      .populate('userId', 'fullName email username profilePicture');
  }

  // Get all reviews with filters
  async getReviews(filters: {
    profileId?: string;
    userId?: string;
    rating?: number;
    limit?: number;
    skip?: number;
  }): Promise<IReview[]> {
    const query: any = {};

    if (filters.profileId) {
      query.profileId = filters.profileId;
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.rating) {
      query.rating = filters.rating;
    }

    return await Review.find(query)
      .populate('profileId', 'fullName email username profilePicture role')
      .populate('userId', 'fullName email username profilePicture')
      .limit(filters.limit || 50)
      .skip(filters.skip || 0)
      .sort({ createdAt: -1 });
  }

  // Get reviews for a specific profile (teacher)
  async getReviewsByProfile(profileId: string, limit?: number, skip?: number): Promise<IReview[]> {
    return await Review.find({ profileId })
      .populate('profileId', 'fullName email username profilePicture role')
      .populate('userId', 'fullName email username profilePicture')
      .limit(limit || 50)
      .skip(skip || 0)
      .sort({ createdAt: -1 });
  }

  // Get reviews written by a specific user
  async getReviewsByUser(userId: string, limit?: number, skip?: number): Promise<IReview[]> {
    return await Review.find({ userId })
      .populate('profileId', 'fullName email username profilePicture role')
      .populate('userId', 'fullName email username profilePicture')
      .limit(limit || 50)
      .skip(skip || 0)
      .sort({ createdAt: -1 });
  }

  // Update review
  async updateReview(reviewId: string, userId: string, updateData: IReviewUpdate): Promise<IReview | null> {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    // Only the user who wrote the review can update it
    if (review.userId.toString() !== userId) {
      throw new Error('You do not have permission to update this review');
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('profileId', 'fullName email username profilePicture role')
      .populate('userId', 'fullName email username profilePicture');

    // Update teacher's rating if rating was changed
    if (updateData.rating) {
      await this.updateTeacherRating(review.profileId.toString());
    }

    return updatedReview;
  }

  // Delete review
  async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    // Only the user who wrote the review can delete it
    if (review.userId.toString() !== userId) {
      throw new Error('You do not have permission to delete this review');
    }

    const profileId = review.profileId.toString();
    const result = await Review.findByIdAndDelete(reviewId);

    if (result) {
      // Update teacher's rating after deletion
      await this.updateTeacherRating(profileId);
    }

    return result !== null;
  }

  // Update teacher's average rating and total ratings count
  private async updateTeacherRating(profileId: string): Promise<void> {
    const reviews = await Review.find({ profileId });
    
    if (reviews.length === 0) {
      // If no reviews, set rating to 0
      await User.findByIdAndUpdate(profileId, {
        $set: { rating: 0, totalRatings: 0 }
      });
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    const roundedRating = Math.round(averageRating * 10) / 10; // Round to 1 decimal place

    // Update user's rating and totalRatings
    await User.findByIdAndUpdate(profileId, {
      $set: {
        rating: roundedRating,
        totalRatings: reviews.length
      }
    });
  }

  // Get average rating for a profile
  async getAverageRating(profileId: string): Promise<{ average: number; total: number }> {
    const reviews = await Review.find({ profileId });
    
    if (reviews.length === 0) {
      return { average: 0, total: 0 };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = Math.round((totalRating / reviews.length) * 10) / 10;

    return { average, total: reviews.length };
  }
}

