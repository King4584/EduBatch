import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { Notice } from '../models/Notice.js';
import { Batch } from '../models/Batch.js';
import { Enrollment } from '../models/Enrollment.js';
import { ApiError } from '../utils/apiError.js';
import { sendResponse } from '../utils/apiResponse.js';

export const getNotices = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let query: any = {};
    const rawBatchId = req.params.batchId || req.query.batchId;
    const targetBatchId = rawBatchId ? String(rawBatchId) : undefined;

    if (targetBatchId) {
      if (userRole === 'admin') {
        query = { batch: targetBatchId };
      } else if (userRole === 'teacher') {
        const assigned = await Batch.findOne({ _id: targetBatchId, teacher: userId });
        if (!assigned) {
          throw ApiError.forbidden('Unauthorized to view notices for this batch');
        }
        query = { batch: targetBatchId };
      } else if (userRole === 'student') {
        const enrolled = await Enrollment.findOne({ student: userId, batch: targetBatchId, isActive: true });
        if (!enrolled) {
          throw ApiError.forbidden('Unauthorized to view notices for this batch');
        }
        query = { batch: targetBatchId };
      }
    } else {
      if (userRole === 'admin') {
        // Admin sees all notices
        query = {};
      } else if (userRole === 'teacher') {
        // Teacher sees global notices (batch == null) and notices for their assigned batches
        const assignedBatches = await Batch.find({ teacher: userId }).select('_id');
        const batchIds = assignedBatches.map((b) => b._id);
        query = {
          $or: [{ batch: null }, { batch: { $in: batchIds } }],
        };
      } else if (userRole === 'student') {
        // Student sees global notices (batch == null) and notices for batches they are enrolled in
        const enrollments = await Enrollment.find({ student: userId, isActive: true }).select('batch');
        const batchIds = enrollments.map((e) => e.batch);
        query = {
          $or: [{ batch: null }, { batch: { $in: batchIds } }],
        };
      }
    }

    const notices = await Notice.find(query)
      .populate('createdBy', 'name email role')
      .populate('batch', 'name subject')
      .sort({ pinned: -1, createdAt: -1 })
      .lean();

    const formatted = notices.map((n) => ({
      id: n._id,
      title: n.title,
      content: n.body,
      category: n.category,
      pinned: n.pinned,
      date: new Date(n.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      author: (n.createdBy as any)?.name || 'Admin',
      batch: (n.batch as any)?.name || null,
      batchId: (n.batch as any)?._id || null,
    }));

    sendResponse(res, 200, 'Notices retrieved', formatted);
  } catch (error) {
    next(error);
  }
};

export const createNotice = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, body, category = 'Academic', pinned = false, batch = null } = req.body;

    // Check teacher permission if creating for batch
    if (req.user?.role === 'teacher' && batch) {
      const assigned = await Batch.findOne({ _id: batch, teacher: req.user.id });
      if (!assigned) {
        throw ApiError.forbidden('Teachers can only publish notices for their assigned batches');
      }
    }

    // Only admins can post global notices or pin notices
    const isPinned = req.user?.role === 'admin' ? Boolean(pinned) : false;

    const notice = await Notice.create({
      title,
      body,
      category,
      pinned: isPinned,
      batch: batch || null,
      createdBy: req.user!.id,
    });

    const populated = await Notice.findById(notice._id)
      .populate('createdBy', 'name')
      .populate('batch', 'name')
      .lean();

    sendResponse(res, 201, 'Notice published successfully', {
      id: populated?._id,
      title: populated?.title,
      content: populated?.body,
      category: populated?.category,
      pinned: populated?.pinned,
      date: new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      author: (populated?.createdBy as any)?.name || req.user?.name,
      batch: (populated?.batch as any)?.name || null,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotice = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const notice = await Notice.findById(id);

    if (!notice) {
      throw ApiError.notFound('Notice not found');
    }

    if (req.user?.role !== 'admin' && notice.createdBy.toString() !== req.user?.id) {
      throw ApiError.forbidden('Unauthorized to edit this notice');
    }

    const updated = await Notice.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name');

    sendResponse(res, 200, 'Notice updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteNotice = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const notice = await Notice.findById(id);

    if (!notice) {
      throw ApiError.notFound('Notice not found');
    }

    if (req.user?.role !== 'admin' && notice.createdBy.toString() !== req.user?.id) {
      throw ApiError.forbidden('Unauthorized to delete this notice');
    }

    await Notice.findByIdAndDelete(id);
    sendResponse(res, 200, 'Notice deleted successfully');
  } catch (error) {
    next(error);
  }
};
