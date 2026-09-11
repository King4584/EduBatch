import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { sendResponse } from '../utils/apiResponse.js';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      throw ApiError.notFound('User not found');
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
