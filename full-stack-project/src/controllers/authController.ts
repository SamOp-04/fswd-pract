import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { sendOtpEmail,sendResetPasswordEmail } from '../utils/sendEmail';
import { generateResetToken } from '../utils/generateResetToken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: '7d'  // 🔐 Token valid for 7 days
  });
};

// STEP 1: Signup + Send OTP
export const signup = async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;
  try {
    const userExists = await User.findOne({ email });

    if (userExists && userExists.isVerified) {
      return res.status(400).json({ error: 'User already registered and verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    let user;

    if (userExists) {
      // ✅ Update existing unverified user, trigger pre-save hook
      userExists.name = name;
      userExists.phone = phone;
      userExists.password = password; // will be hashed in pre-save
      userExists.otp = otp;
      userExists.isVerified = false;
      user = await userExists.save();
    } else {
      // ✅ Create new user
      user = await User.create({ name, email, phone, password, otp });
    }

    await sendOtpEmail(email, otp);

    res.status(200).json({ message: 'OTP sent to email for verification' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


// STEP 2: Verify OTP
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otp = '';
    await user.save();

    const token = generateToken(user.id);
    res.status(200).json({ message: 'Account verified and logged in', token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// STEP 3: Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(401).json({ error: 'User not verified or doesn’t exist' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = generateToken(user.id);

    // ✅ Include user details in the response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { resetToken, hashedToken } = generateResetToken();

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
  await user.save();

  const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetToken}`;

  try {
    await sendResetPasswordEmail(
      user.email,
      'Password Reset Request',
      `Reset your password using this link: ${resetUrl}`
    );

    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).json({ error: 'Email could not be sent' });
  }
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() }
  });

  if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ message: 'Password reset successful' });
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('-password -otp -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};