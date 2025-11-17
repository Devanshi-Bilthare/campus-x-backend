import { Document, Types } from 'mongoose';

// Offering Interface
export interface IOffering extends Document {
  title: string;
  description: string;
  tags: string[]; // Array of tags like #dance, #study, #code, #python
  slots: string[]; // Array of time slots like "7-8pm", "8-10am", "1-4pm"
  duration: string; // Duration like "30min", "2hr", "1 hour"
  userId: Types.ObjectId; // Reference to the user who created the offering
  completedCount: number; // Number of people who completed this offering
  createdAt: Date;
  updatedAt: Date;
}

// Offering Creation DTO
export interface IOfferingCreation {
  title: string;
  description: string;
  tags: string[];
  slots: string[];
  duration: string;
}

// Offering Update DTO
export interface IOfferingUpdate {
  title?: string;
  description?: string;
  tags?: string[];
  slots?: string[];
  duration?: string;
}

