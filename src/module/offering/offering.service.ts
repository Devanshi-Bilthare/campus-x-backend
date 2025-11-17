import { Offering } from '../../models/offering.model';
import { IOffering, IOfferingCreation, IOfferingUpdate } from '../../interface/offering.interface';

export class OfferingService {
  // Create a new offering
  async createOffering(userId: string, offeringData: IOfferingCreation): Promise<IOffering> {
    const offering = new Offering({
      ...offeringData,
      userId,
      completedCount: 0
    });
    
    return await offering.save();
  }

  // Get offering by ID
  async getOfferingById(offeringId: string): Promise<IOffering | null> {
    return await Offering.findById(offeringId).populate('userId', 'fullName email username profilePicture');
  }

  // Get all offerings with filters
  async getOfferings(filters: {
    userId?: string;
    tags?: string[];
    slots?: string[];
    duration?: string;
    limit?: number;
    skip?: number;
    sortBy?: 'createdAt' | 'completedCount';
    sortOrder?: 'asc' | 'desc';
  }): Promise<IOffering[]> {
    const query: any = {};

    // Filter by user
    if (filters.userId) {
      query.userId = filters.userId;
    }

    // Filter by tags (at least one tag should match)
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    // Filter by slots (at least one slot should match)
    if (filters.slots && filters.slots.length > 0) {
      query.slots = { $in: filters.slots };
    }

    // Filter by duration (exact match)
    if (filters.duration) {
      query.duration = filters.duration;
    }

    // Sort options
    const sortOptions: any = {};
    if (filters.sortBy) {
      sortOptions[filters.sortBy] = filters.sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = -1; // Default sort by newest first
    }

    return await Offering.find(query)
      .populate('userId', 'fullName email username profilePicture')
      .limit(filters.limit || 50)
      .skip(filters.skip || 0)
      .sort(sortOptions);
  }

  // Update offering
  async updateOffering(offeringId: string, userId: string, updateData: IOfferingUpdate): Promise<IOffering | null> {
    // Verify that the user owns this offering
    const offering = await Offering.findOne({ _id: offeringId, userId });
    
    if (!offering) {
      throw new Error('Offering not found or you do not have permission to update it');
    }

    return await Offering.findByIdAndUpdate(
      offeringId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'fullName email username profilePicture');
  }

  // Delete offering
  async deleteOffering(offeringId: string, userId: string): Promise<boolean> {
    // Verify that the user owns this offering
    const offering = await Offering.findOne({ _id: offeringId, userId });
    
    if (!offering) {
      throw new Error('Offering not found or you do not have permission to delete it');
    }

    const result = await Offering.findByIdAndDelete(offeringId);
    return result !== null;
  }

  // Increment completed count (called when a booking is marked as completed)
  async incrementCompletedCount(offeringId: string): Promise<void> {
    await Offering.findByIdAndUpdate(
      offeringId,
      { $inc: { completedCount: 1 } }
    );
  }

  // Get offerings by user
  async getOfferingsByUser(userId: string, limit?: number, skip?: number): Promise<IOffering[]> {
    return await Offering.find({ userId })
      .populate('userId', 'fullName email username profilePicture')
      .limit(limit || 50)
      .skip(skip || 0)
      .sort({ createdAt: -1 });
  }
}

