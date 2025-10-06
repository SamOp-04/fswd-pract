import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId; // Assume it's set by your auth middleware

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No user ID found in request' });
    }

    const user = await User.findById(userId);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};
