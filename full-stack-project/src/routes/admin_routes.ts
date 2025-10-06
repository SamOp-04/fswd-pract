import express from 'express';
import { getTodaysAttendance, verifyAttendance, getUserMonthlyAttendance, getAllUsers } from '../controllers/admin_controller';
import { verifyToken } from '../middleware/authMiddleware'; // ✅ import the actual middleware function
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// 🛡️ Middleware to check login + populate req.user
router.use(verifyToken); // ✅ Use middleware, not the interface!

// ✅ Admin-only routes
// Helper to wrap async route handlers and forward errors to Express
const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/today-attendance', asyncHandler(getTodaysAttendance));
router.post('/verify-attendance', asyncHandler(verifyAttendance));
router.get('/user-attendance/:userId', asyncHandler(getUserMonthlyAttendance));
router.get('/users', asyncHandler(getAllUsers));
export default router;
