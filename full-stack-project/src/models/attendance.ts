import mongoose, { Schema, Document } from 'mongoose';

interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  startTime?: Date;
  endTime?: Date;
  startLocation?: string;
  endLocation?: string;
  tasks: string[];
  verified?: boolean;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    startTime: { type: Date },
    endTime: { type: Date },
    startLocation: {
      type: String
    },
    endLocation: {
      type: String
    },
    tasks: [String],
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);