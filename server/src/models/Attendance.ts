import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface IAttendanceRecord {
  student: Types.ObjectId;
  status: AttendanceStatus;
  remarks?: string;
}

export interface IAttendance extends Document {
  batch: Types.ObjectId;
  date: string; // YYYY-MM-DD
  records: IAttendanceRecord[];
  markedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      required: true,
      default: 'Present',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const AttendanceSchema = new Schema<IAttendance>(
  {
    batch: {
      type: Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch is required'],
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Date string (YYYY-MM-DD) is required'],
      index: true,
    },
    records: [AttendanceRecordSchema],
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'MarkedBy teacher/admin is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance records for same batch on same date
AttendanceSchema.index({ batch: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendance> = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
