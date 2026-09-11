import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type NoticeCategory = 'Holiday' | 'Academic' | 'Finance' | 'Batch' | 'Event';

export interface INotice extends Document {
  batch?: Types.ObjectId | null; // null/undefined means global notice
  title: string;
  body: string;
  category: NoticeCategory;
  pinned: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    batch: {
      type: Schema.Types.ObjectId,
      ref: 'Batch',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Notice content is required'],
    },
    category: {
      type: String,
      enum: ['Holiday', 'Academic', 'Finance', 'Batch', 'Event'],
      default: 'Academic',
    },
    pinned: {
      type: Boolean,
      default: false,
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
  }
);

export const Notice: Model<INotice> = mongoose.model<INotice>('Notice', NoticeSchema);
