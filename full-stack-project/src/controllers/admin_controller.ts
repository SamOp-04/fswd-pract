import { Request, Response } from 'express';
import Attendance from '../models/attendance';
import mongoose from 'mongoose';
import User from '../models/User';

// 🔒 Helper function to check admin role safely
const isAdmin = (req: Request): boolean => {
  const user = (req as any).user;
  return user && user.role === 'admin';
};

// ============================
// 📅 1. Get Today's Attendance
// ============================
export const getTodaysAttendance = async (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied. Admin only.' });

  try {
    const today = new Date().toDateString();

    const records = await Attendance.find({ date: today })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(records);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err });
  }
};

// ==========================================
// ✅ 2. Verify Attendance (Set Verified True)
// ==========================================
export const verifyAttendance = async (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied. Admin only.' });

  try {
    const { verifiedAttendanceIds } = req.body;

    if (!Array.isArray(verifiedAttendanceIds)) {
      return res.status(400).json({ message: 'verifiedAttendanceIds must be an array' });
    }

    const result = await Attendance.updateMany(
      { _id: { $in: verifiedAttendanceIds } },
      { $set: { verified: true } }
    );

    return res.status(200).json({ message: '✅ Attendance verified', result });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err });
  }
};

// ====================================
// 📆 3. Get Monthly Attendance by User
// ====================================
export const getUserMonthlyAttendance = async (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied. Admin only.' });

  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const start = new Date();
    start.setDate(1);
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);

    const records = await Attendance.find({
      userId,
      createdAt: { $gte: start, $lte: end },
    });

    const totalDays = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();

    // Count Sundays
    let sundays = 0;
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(start.getFullYear(), start.getMonth(), i);
      if (date.getDay() === 0) sundays++;
    }

    const effectiveDays = totalDays - sundays;
    const presentDays = records.length;
    const absentDays = effectiveDays - presentDays;
    const gross = effectiveDays > 0 ? Math.round((presentDays / effectiveDays) * 100) : 0;

    return res.status(200).json({
      presentDays,
      absentDays,
      totalDays: effectiveDays,
      gross,
      records,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err });
  }
};



// ===============================
// 👥 4. Get All Users (Admin only)
// ===============================
export const getAllUsers = async (req: Request, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ message: 'Access denied. Admin only.' });

  try {
    const users = await User.find({}, '_id name email');

    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err });
  }
};
