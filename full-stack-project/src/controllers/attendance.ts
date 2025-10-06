import { Request, Response } from 'express';
import Attendance from '../models/attendance';
import mongoose from 'mongoose';

// POST /api/attendance/start
export const startAttendance = async (req: Request, res: Response) => {
  try {
    const { userId, location } = req.body;

    const existing = await Attendance.findOne({
      userId,
      date: new Date().toDateString(),
    });

    if (existing) return res.status(400).json({ message: 'Attendance already started today' });

    const newRecord = await Attendance.create({
      userId,
      date: new Date().toDateString(),
      startTime: new Date(),
      startLocation: location,
    });

    return res.status(201).json(newRecord);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err });
  }
};

// POST /api/attendance/done
export const completeAttendance = async (req: Request, res: Response) => {
  try {
    const { userId, location, tasks } = req.body;

    const record = await Attendance.findOne({
      userId,
      date: new Date().toDateString(),
    });

    if (!record) return res.status(404).json({ message: 'No attendance started' });

    record.endTime = new Date();
    record.endLocation = location;
    record.tasks = tasks;
    await record.save();

    return res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err });
  }
};

// GET /api/attendance/monthly/:userId
export const getMonthlyAttendance = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || new Date().getMonth(); // 0 = Jan

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0); // Last day of month

    // Count Sundays and record Sunday dates
    let sundayCount = 0;
    const sundayDates: string[] = [];

    for (let day = 1; day <= end.getDate(); day++) {
      const date = new Date(year, month, day);
      if (date.getDay() === 0) {
        sundayCount++;
        sundayDates.push(date.toDateString());
      }
    }

    const totalDays = end.getDate();
    const workingDays = totalDays - sundayCount;

    // ✅ Only count verified attendance
    const allRecords = await Attendance.find({
      userId,
      createdAt: { $gte: start, $lte: end },
    });

    const verifiedRecords = allRecords.filter(record => record.verified === true);

    const presentDays = verifiedRecords.length;
    const absentDays = workingDays - presentDays;
    const gross = Math.round((presentDays / workingDays) * 100);

    return res.status(200).json({
      presentDays,
      absentDays,
      totalDays: workingDays,
      gross,
      records: verifiedRecords,   // ⬅️ only return verified attendance
      sundays: sundayDates,
      fullMonthDays: totalDays,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err });
  }
};


// GET /api/attendance/details/:userId/:date
export const getAttendanceByDate = async (req: Request, res: Response) => {
  try {
    const { userId, date } = req.params; // date = '2024-06-25'
    const formattedDate = new Date(date).toDateString();

    const record = await Attendance.findOne({ userId, date: formattedDate });
    if (!record) return res.status(404).json({ message: 'No record for this date' });

    return res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err });
  }
};