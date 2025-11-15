import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../../models/user.model';
import { IUser, IUserRegistration, IUserUpdate, IUserLogin, IPasswordUpdate, IJWTPayload } from '../../interface/user.interface';
import { emailService } from '../../config/email';

export class UserService {
  // Hash password
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // Compare password
  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Generate JWT token
  generateToken(payload: IJWTPayload): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    const jwtExpire = process.env.JWT_EXPIRE || '7d';

    return jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpire
    } as SignOptions);
  }

  // Create a new user
  async createUser(userData: IUserRegistration): Promise<IUser> {
    // Hash password before saving
    const hashedPassword = await this.hashPassword(userData.password);
    
    const user = new User({
      ...userData,
      password: hashedPassword
    });
    
    return await user.save();
  }

  // Find user by ID
  async getUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }

  // Find user by email
  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() });
  }

  // Find user by username
  async getUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }

  // Login user
  async loginUser(loginData: IUserLogin): Promise<{ user: IUser; token: string } | null> {
    let user: IUser | null = null;

    // Find user by email or username
    if (loginData.email) {
      user = await this.getUserByEmail(loginData.email);
    } else if (loginData.username) {
      user = await this.getUserByUsername(loginData.username);
    }

    if (!user) {
      return null;
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(loginData.password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Generate token
    const token = this.generateToken({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role
    });

    return { user, token };
  }

  // Update user
  async updateUser(userId: string, updateData: IUserUpdate): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  // Update password
  async updatePassword(userId: string, passwordData: IPasswordUpdate): Promise<boolean> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await this.comparePassword(passwordData.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(passwordData.newPassword);
    
    // Update password
    user.password = hashedPassword;
    await user.save();

    return true;
  }

  // Forgot password - Generate reset token
  async forgotPassword(email: string): Promise<void> {
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      // Don't reveal if user exists or not for security
      // Just return silently
      return;
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set token expiry to 1 hour from now
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

    // Save reset token and expiry to database
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.fullName
      );
    } catch (error) {
      // If email fails, clear the token
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      throw new Error('Failed to send password reset email. Please try again later.');
    }
  }

  // Reset password using token
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Find user by reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() } // Token must not be expired
    });

    if (!user) {
      throw new Error('Invalid or expired reset token. Please request a new password reset.');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);
    
    // Update password and clear reset token fields
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return true;
  }

  // Delete user (soft delete by setting isActive to false)
  async deleteUser(userId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { isActive: false } },
      { new: true }
    );
  }

  // Get all users with filters
  async getUsers(filters: {
    role?: 'student' | 'teacher';
    city?: string;
    isActive?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<IUser[]> {
    const query: any = {};
    
    if (filters.role) query.role = filters.role;
    if (filters.city) query.city = filters.city;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    return await User.find(query)
      .limit(filters.limit || 50)
      .skip(filters.skip || 0)
      .sort({ createdAt: -1 });
  }

  // Find users by skill
  async getUsersBySkill(skill: string): Promise<IUser[]> {
    return await User.find({
      $or: [
        { 'skills.academic': skill },
        { 'skills.hobby': skill },
        { 'skills.other': skill }
      ],
      isActive: true
    });
  }

  // Find students by branch
  async getStudentsByBranch(branch: string): Promise<IUser[]> {
    return await User.find({
      role: 'student',
      'academics.branch': branch,
      isActive: true
    });
  }

  // Find teachers by experience
  async getTeachersByExperience(minYears: number): Promise<IUser[]> {
    return await User.find({
      role: 'teacher',
      'academics.yearsOfExperience': { $gte: minYears },
      isActive: true
    });
  }
}
