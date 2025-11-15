import mongoose, { Schema } from 'mongoose';
import { IUser, IAcademicDetails, ISocialMedia, ICertificate } from '../interface/user.interface';

// Academic Details Schema
const AcademicDetailsSchema = new Schema<IAcademicDetails>({
  branch: {
    type: String,
    trim: true
  },
  semester: {
    type: Number,
    min: 1,
    max: 12
  },
  collegeName: {
    type: String,
    trim: true
  },
  yearOfGraduation: {
    type: Number,
    min: 1900,
    max: 2100
  },
  yearOfJoining: {
    type: Number,
    min: 1900,
    max: 2100
  },
  gpa: {
    type: Number,
    min: 0,
    max: 10
  },
  degree: {
    type: String,
    trim: true
  },
  yearsOfExperience: {
    type: Number,
    min: 0
  }
}, { _id: false });

// Social Media Schema
const SocialMediaSchema = new Schema<ISocialMedia>({
  instagram: {
    type: String,
    trim: true
  },
  linkedin: {
    type: String,
    trim: true
  },
  github: {
    type: String,
    trim: true
  },
  leetcode: {
    type: String,
    trim: true
  },
  twitter: {
    type: String,
    trim: true
  },
  youtube: {
    type: String,
    trim: true
  }
}, { _id: false });

// Certificate Schema
const CertificateSchema = new Schema<ICertificate>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  issuer: {
    type: String,
    required: true,
    trim: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  },
  credentialId: {
    type: String,
    trim: true
  },
  credentialUrl: {
    type: String,
    trim: true
  }
}, { _id: false });

// User Schema
const UserSchema = new Schema<IUser>({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Please provide a valid phone number']
  },
  city: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    default: 'student',
    required: true
  },
  academics: {
    type: AcademicDetailsSchema
  },
  skills: {
    academic: {
      type: [{
        type: String,
        trim: true
      }],
      default: []
    },
    hobby: {
      type: [{
        type: String,
        trim: true
      }],
      default: []
    },
    other: {
      type: [{
        type: String,
        trim: true
      }],
      default: []
    }
  },
  certificates: [CertificateSchema],
  about: {
    type: String,
    maxlength: [1000, 'About section cannot exceed 1000 characters']
  },
  socialMedia: {
    type: SocialMediaSchema
  },
  profilePicture: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalRatings: {
    type: Number,
    min: 0,
    default: 0
  },
  passwordResetToken: {
    type: String,
    trim: true
  },
  passwordResetExpires: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret) {
      const { password, passwordResetToken, passwordResetExpires, ...userWithoutSensitive } = ret;
      return userWithoutSensitive;
    }
  },
  toObject: {
    transform: function(_doc, ret) {
      const { password, passwordResetToken, passwordResetExpires, ...userWithoutSensitive } = ret;
      return userWithoutSensitive;
    }
  }
});

// Pre-save validation: Ensure academics fields match role
UserSchema.pre('save', function(next) {
  if (this.role === 'student' && this.academics) {
    // For students, remove teacher-specific fields
    const academics = this.academics as any;
    if (academics.degree !== undefined) {
      academics.degree = undefined;
    }
    if (academics.yearsOfExperience !== undefined) {
      academics.yearsOfExperience = undefined;
    }
  } else if (this.role === 'teacher' && this.academics) {
    // For teachers, remove student-specific fields
    const academics = this.academics as any;
    if (academics.semester !== undefined) {
      academics.semester = undefined;
    }
    if (academics.gpa !== undefined) {
      academics.gpa = undefined;
    }
  }
  next();
});

// Create and export the model
export const User = mongoose.model<IUser>('User', UserSchema);

