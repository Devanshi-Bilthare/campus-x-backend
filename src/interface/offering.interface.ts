import { Document, Types } from 'mongoose';

// Offering Interface
export interface IOffering extends Document {
  title: string;
  description: string;
  tags: string[]; // Array of tags like #dance, #study, #code, #python
  slots: string[]; // Array of time slots like "7-8pm", "8-10am", "1-4pm"
  duration: string; // Duration like "30min", "2hr", "1 hour"
  image?: string; // Optional image URL
  userId: Types.ObjectId; // Reference to the user who created the offering
  completedCount: number; // Number of people who completed this offering
  bookedSlots?: Array<{ slot: string; date: Date }>; // Track booked slot+date combinations
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
  image?: string;
}

// Offering Update DTO
export interface IOfferingUpdate {
  title?: string;
  description?: string;
  tags?: string[];
  slots?: string[];
  duration?: string;
  image?: string;
}

