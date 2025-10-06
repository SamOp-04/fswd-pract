import express from 'express';
import {
  startAttendance,
  completeAttendance,
  getMonthlyAttendance,
  getAttendanceByDate,
} from '../controllers/attendance';
import { verifyToken } from '../middleware/authMiddleware'; // ✅ Add this
import { RequestHandler } from 'express';

const router = express.Router();

// ✅ Protect all routes with verifyToken
router.post('/start', startAttendance as RequestHandler);
router.post('/done', completeAttendance as RequestHandler);
router.get('/monthly/:userId', getMonthlyAttendance as RequestHandler);
router.get('/details/:userId/:date', getAttendanceByDate as RequestHandler);

export default router;
