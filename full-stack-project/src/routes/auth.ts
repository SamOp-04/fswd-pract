import express from 'express';
import { signup, login, verifyOtp, getProfile } from '../controllers/authController';
import { forgotPassword, resetPassword } from '../controllers/authController';
import { verifyToken } from '../middleware/authMiddleware';


const router = express.Router();

router.post('/signup', (req, res, next) => {
  Promise.resolve(signup(req, res)).catch(next);
});
router.post('/login', (req, res, next) => {
  Promise.resolve(login(req, res)).catch(next);
});
router.post('/verify-otp', (req, res, next) => {
  Promise.resolve(verifyOtp(req, res)).catch(next);
});
router.post('/forgot-password', (req, res, next) => {
  Promise.resolve(forgotPassword(req, res)).catch(next);
});
router.post('/reset-password/:token', (req, res, next) => {
  Promise.resolve(resetPassword(req, res)).catch(next);
});
router.get('/profile', verifyToken, (req, res, next) => {
  Promise.resolve(getProfile(req, res)).catch(next);
});

export default router;