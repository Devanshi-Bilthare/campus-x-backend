import { Document } from 'mongoose';

// Academic Details Interface
export interface IAcademicDetails {
  branch?: string;
  semester?: number; // For students
  collegeName?: string;
  yearOfGraduation?: number;
  yearOfJoining?: number;
  gpa?: number; // For students
  degree?: string; // For teachers
  yearsOfExperience?: number; // For teachers
}

// Social Media Interface
export interface ISocialMedia {
  instagram?: string;
  linkedin?: string;
  github?: string;
  leetcode?: string;
  twitter?: string;
  youtube?: string;
}

// Certificate Interface
export interface ICertificate {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
}

// Skills Interface
export interface ISkills {
  academic: string[];
  hobby: string[];
  other: string[];
}

// User Interface
export interface IUser extends Document {
  fullName: string;
  email: string;
  username: string;
  password: string;
  phoneNumber?: string;
  city?: string;
  gender?: 'male' | 'female' | 'other';
  role: 'student' | 'teacher';
  academics?: IAcademicDetails;
  skills: ISkills;
  certificates?: ICertificate[];
  about?: string;
  socialMedia?: ISocialMedia;
  profilePicture?: string;
  isVerified: boolean;
  isActive: boolean;
  rating?: number;
  totalRatings?: number;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User Registration DTO
export interface IUserRegistration {
  fullName: string;
  email: string;
  username: string;
  password: string;
  phoneNumber?: string;
  city?: string;
  role?: 'student' | 'teacher';
}

// User Update DTO
export interface IUserUpdate {
  fullName?: string;
  phoneNumber?: string;
  city?: string;
  academics?: IAcademicDetails;
  skills?: ISkills;
  certificates?: ICertificate[];
  about?: string;
  socialMedia?: ISocialMedia;
  profilePicture?: string;
  gender?: 'male' | 'female' | 'other';
}

// Login DTO
export interface IUserLogin {
  email?: string;
  username?: string;
  password: string;
}

// Password Update DTO
export interface IPasswordUpdate {
  currentPassword: string;
  newPassword: string;
}

// Forgot Password DTO
export interface IForgotPassword {
  email: string;
}

// Reset Password DTO
export interface IResetPassword {
  token: string;
  newPassword: string;
}

// JWT Payload
export interface IJWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'teacher';
}

