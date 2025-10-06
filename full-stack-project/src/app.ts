import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import attendanceRoutes from './routes/attendance';
import adminRoutes from './routes/admin_routes';

const app = express();

// ✅ Body parser to fix req.body undefined error
app.use(express.json());

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(cors()); 
// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

export default app;
