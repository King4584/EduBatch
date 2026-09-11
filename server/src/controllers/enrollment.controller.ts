import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { Enrollment } from '../models/Enrollment.js';
import { Batch } from '../models/Batch.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { sendResponse } from '../utils/apiResponse.js';

export const enrollStudent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { student, batch, paymentStatus = 'pending' } = req.body;

    // Verify batch exists and is active/upcoming
    const targetBatch = await Batch.findById(batch);
    if (!targetBatch) {
      throw ApiError.notFound('Batch not found');
    }

    if (targetBatch.status === 'archived') {
      throw ApiError.badRequest('Cannot enroll into an archived batch');
    }

    // Verify student exists
    const targetStudent = await User.findById(student);
    if (!targetStudent || targetStudent.role !== 'student') {
      throw ApiError.badRequest('Target user must be a registered student');
    }

    // Check existing active enrollment
    const existing = await Enrollment.findOne({ student, batch, isActive: true });
    if (existing) {
      throw ApiError.conflict('Student is already enrolled in this batch');
    }

    // Capacity check: count active enrollments
    const currentEnrolledCount = await Enrollment.countDocuments({ batch, isActive: true });
    if (currentEnrolledCount >= targetBatch.capacity) {
      throw ApiError.badRequest(
        `Batch has reached full capacity (${currentEnrolledCount}/${targetBatch.capacity}). Enrollment denied.`
      );
    }

    const enrollment = await Enrollment.create({
      student,
      batch,
      paymentStatus,
      isActive: true,
      enrolledAt: new Date(),
    });

    const populated = await Enrollment.findById(enrollment._id)
      .populate('student', 'name email phone avatar')
      .populate('batch', 'name subject fee capacity')
      .lean();

    sendResponse(res, 201, 'Student successfully enrolled into batch', populated);
  } catch (error) {
    next(error);
  }
};

export const getEnrollments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { batchId, studentId, paymentStatus, page = 1, limit = 20 } = req.query;

    const query: any = { isActive: true };
    if (batchId) query.batch = batchId;
    if (studentId) query.student = studentId;
    if (paymentStatus && paymentStatus !== 'All') query.paymentStatus = paymentStatus;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [enrollments, total] = await Promise.all([
      Enrollment.find(query)
        .populate('student', 'name email phone avatar')
        .populate('batch', 'name subject fee capacity startDate endDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Enrollment.countDocuments(query),
    ]);

    sendResponse(res, 200, 'Enrollments retrieved', enrollments, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const getMyEnrollments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const enrollments = await Enrollment.find({ student: req.user!.id, isActive: true })
      .populate({
        path: 'batch',
        populate: { path: 'teacher', select: 'name email avatar' },
      })
      .sort({ enrolledAt: -1 })
      .lean();

    sendResponse(res, 200, 'My enrollments retrieved', enrollments);
  } catch (error) {
    next(error);
  }
};

export const cancelEnrollment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      throw ApiError.notFound('Enrollment record not found');
    }

    enrollment.isActive = false;
    await enrollment.save();

    sendResponse(res, 200, 'Enrollment cancelled successfully');
  } catch (error) {
    next(error);
  }
};
