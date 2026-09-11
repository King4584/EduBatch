import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type PaymentStatus = 'pending' | 'paid' | 'waived';

export interface IEnrollment extends Document {
  student: Types.ObjectId;
  batch: Types.ObjectId;
  enrolledAt: Date;
  paymentStatus: PaymentStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
      index: true,
    },
    batch: {
      type: Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch is required'],
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'waived'],
      default: 'pending',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of active enrollment per student per batch
EnrollmentSchema.index({ student: 1, batch: 1 });

export const Enrollment: Model<IEnrollment> = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
