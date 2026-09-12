import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type BatchStatus = 'upcoming' | 'active' | 'archived';

export interface IBatch extends Document {
  name: string;
  subject: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  scheduleDays: string[];
  startTime: string;
  endTime: string;
  capacity: number;
  fee: number;
  status: BatchStatus;
  teacher: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    name: {
      type: String,
      required: [true, 'Batch name is required'],
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    scheduleDays: {
      type: [String],
      default: ['Mon', 'Wed', 'Fri'],
    },
    startTime: {
      type: String,
      default: '10:00 AM',
    },
    endTime: {
      type: String,
      default: '12:00 PM',
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    fee: {
      type: Number,
      required: [true, 'Fee is required'],
      min: [0, 'Fee cannot be negative'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'archived'],
      default: 'active',
      index: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher assignment is required'],
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual schedule object { days, startTime, endTime } per specification
BatchSchema.virtual('schedule').get(function (this: IBatch) {
  return {
    days: this.scheduleDays,
    startTime: this.startTime,
    endTime: this.endTime,
  };
});

export const Batch: Model<IBatch> = mongoose.model<IBatch>('Batch', BatchSchema);
