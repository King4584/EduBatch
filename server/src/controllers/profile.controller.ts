import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { User } from '../models/User.js';
import { Batch } from '../models/Batch.js';
import { Enrollment } from '../models/Enrollment.js';
import { ApiError } from '../utils/apiError.js';
import { sendResponse } from '../utils/apiResponse.js';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    let associatedBatches: any[] = [];
    if (user.role === 'student') {
      const enrollments = await Enrollment.find({ student: user._id, isActive: true })
        .populate('batch', 'name subject scheduleDays startTime endTime status fee')
        .lean();
      associatedBatches = enrollments
        .filter((e) => e.batch)
        .map((e) => ({
          id: (e.batch as any)._id,
          name: (e.batch as any).name,
          subject: (e.batch as any).subject,
          scheduleDays: (e.batch as any).scheduleDays,
          startTime: (e.batch as any).startTime,
          endTime: (e.batch as any).endTime,
          status: (e.batch as any).status,
          fee: (e.batch as any).fee,
          enrolledAt: e.enrolledAt,
          paymentStatus: e.paymentStatus,
        }));
    } else if (user.role === 'teacher') {
      const batches = await Batch.find({ teacher: user._id, status: { $ne: 'archived' } })
        .select('name subject scheduleDays startTime endTime status capacity fee')
        .lean();
      associatedBatches = batches.map((b) => ({
        id: b._id,
        name: b.name,
        subject: b.subject,
        scheduleDays: b.scheduleDays,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        capacity: b.capacity,
        fee: b.fee,
      }));
    }

    sendResponse(res, 200, 'Profile retrieved', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      city: user.city || '',
      institute: user.institute || 'EduBatch Learning Centre',
      bio: user.bio || '',
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`,
      associatedBatches,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, phone, city, institute, bio, avatar } = req.body;

    const user = await User.findById(req.user!.id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (institute !== undefined) user.institute = institute;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    sendResponse(res, 200, 'Profile updated successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      city: user.city,
      institute: user.institute,
      bio: user.bio,
      avatar: user.avatar,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user!.id).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password does not match');
    }

    user.password = newPassword;
    await user.save();

    sendResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, search } = req.query;
    const query: any = { isActive: true };

    if (role && ['admin', 'teacher', 'student'].includes(role.toString())) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search.toString(), $options: 'i' } },
        { email: { $regex: search.toString(), $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ name: 1 }).lean();

    sendResponse(
      res,
      200,
      'Users retrieved',
      users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        city: u.city,
        institute: u.institute,
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`,
        createdAt: u.createdAt,
      }))
    );
  } catch (error) {
    next(error);
  }
};
