import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { Batch } from '../models/Batch.js';
import { Enrollment } from '../models/Enrollment.js';
import { ApiError } from '../utils/apiError.js';
import { sendResponse } from '../utils/apiResponse.js';

export const getBatches = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status, page = 1, limit = 10, sort = 'name', order = 'asc' } = req.query;

    const query: any = {};
    if (status && status !== 'All') {
      query.status = status.toString().toLowerCase();
    }
    if (search) {
      query.$or = [
        { name: { $regex: search.toString(), $options: 'i' } },
        { subject: { $regex: search.toString(), $options: 'i' } },
      ];
    }

    // If teacher, optionally filter only their batches unless admin
    if (req.user?.role === 'teacher' && req.query.onlyAssigned === 'true') {
      query.teacher = req.user.id;
    }

    const sortOptions: any = {};
    sortOptions[sort.toString()] = order === 'desc' ? -1 : 1;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [batches, total] = await Promise.all([
      Batch.find(query)
        .populate('teacher', 'name email phone avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Batch.countDocuments(query),
    ]);

    // Attach active enrollment counts
    const batchIds = batches.map((b) => b._id);
    const enrollmentCounts = await Enrollment.aggregate([
      { $match: { batch: { $in: batchIds }, isActive: true } },
      { $group: { _id: '$batch', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(enrollmentCounts.map((e) => [e._id.toString(), e.count]));

    const data = batches.map((b) => ({
      ...b,
      id: b._id,
      students: countMap.get(b._id.toString()) || 0,
      teacherName: (b.teacher as any)?.name || 'Unassigned',
    }));

    sendResponse(res, 200, 'Batches retrieved successfully', data, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const getBatchById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const batch = await Batch.findById(id).populate('teacher', 'name email phone avatar bio').lean();

    if (!batch) {
      throw ApiError.notFound('Batch not found');
    }

    // Fetch enrolled students
    const enrollments = await Enrollment.find({ batch: id, isActive: true })
      .populate('student', 'name email phone avatar')
      .lean();

    sendResponse(res, 200, 'Batch details retrieved', {
      ...batch,
      id: batch._id,
      teacherName: (batch.teacher as any)?.name || 'Unassigned',
      enrolledCount: enrollments.length,
      enrollments: enrollments.map((e) => ({
        id: e._id,
        student: e.student,
        paymentStatus: e.paymentStatus,
        enrolledAt: e.enrolledAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const createBatch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const batchData = {
      ...req.body,
      createdBy: req.user!.id,
    };

    const batch = await Batch.create(batchData);
    const populated = await Batch.findById(batch._id).populate('teacher', 'name email').lean();

    sendResponse(res, 201, 'Batch created successfully', {
      ...populated,
      id: populated?._id,
      students: 0,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBatch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const batch = await Batch.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('teacher', 'name email');

    if (!batch) {
      throw ApiError.notFound('Batch not found');
    }

    sendResponse(res, 200, 'Batch updated successfully', batch);
  } catch (error) {
    next(error);
  }
};

export const deleteBatch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const batch = await Batch.findById(id);
    if (!batch) {
      throw ApiError.notFound('Batch not found');
    }

    // Soft archive or delete
    batch.status = 'archived';
    await batch.save();

    sendResponse(res, 200, 'Batch archived successfully');
  } catch (error) {
    next(error);
  }
};

export const updateBatchStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const batch = await Batch.findByIdAndUpdate(id, { status }, { new: true });
    if (!batch) {
      throw ApiError.notFound('Batch not found');
    }

    sendResponse(res, 200, `Batch status updated to ${status}`, batch);
  } catch (error) {
    next(error);
  }
};

export const getTeacherBatches = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const batches = await Batch.find({ teacher: req.user!.id, status: { $ne: 'archived' } })
      .sort({ createdAt: -1 })
      .lean();

    const batchIds = batches.map((b) => b._id);
    const enrollmentCounts = await Enrollment.aggregate([
      { $match: { batch: { $in: batchIds }, isActive: true } },
      { $group: { _id: '$batch', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(enrollmentCounts.map((e) => [e._id.toString(), e.count]));

    const data = batches.map((b) => ({
      ...b,
      id: b._id,
      students: countMap.get(b._id.toString()) || 0,
    }));

    sendResponse(res, 200, 'Assigned batches retrieved', data);
  } catch (error) {
    next(error);
  }
};
