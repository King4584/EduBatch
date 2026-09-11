import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { User } from '../models/User.js';
import { Batch } from '../models/Batch.js';
import { Enrollment } from '../models/Enrollment.js';
import { Payment } from '../models/Payment.js';
import { Attendance } from '../models/Attendance.js';
import { Notice } from '../models/Notice.js';
import { sendResponse } from '../utils/apiResponse.js';

export const getAdminStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalBatches,
      activeBatches,
      paidPayments,
      pendingEnrollments,
      recentPaymentsList,
      recentNotices,
      allAttendanceSessions,
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'teacher', isActive: true }),
      Batch.countDocuments({ status: { $ne: 'archived' } }),
      Batch.countDocuments({ status: 'active' }),
      Payment.find({ status: 'paid' }).lean(),
      Enrollment.find({ paymentStatus: 'pending', isActive: true }).populate('batch', 'fee').lean(),
      Payment.find()
        .populate('student', 'name email')
        .populate('batch', 'name')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Notice.find().sort({ pinned: -1, createdAt: -1 }).limit(3).lean(),
      Attendance.find().sort({ date: -1 }).lean(),
    ]);

    // 1. Total Revenue & Pending Fees from real DB
    const totalRevenue = paidPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const pendingFees = pendingEnrollments.reduce((acc, curr) => acc + ((curr.batch as any)?.fee || 0), 0);

    // 2. Attendance rates strictly calculated from DB
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = allAttendanceSessions.filter((s) => s.date === todayStr);

    let todayAttendanceRate = 0;
    if (todaySessions.length > 0) {
      let todayPresent = 0;
      let todayTotal = 0;
      todaySessions.forEach((s) => {
        s.records.forEach((r) => {
          todayTotal++;
          if (r.status === 'Present') todayPresent++;
        });
      });
      todayAttendanceRate = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0;
    } else if (allAttendanceSessions.length > 0) {
      // If no sessions today, use overall historical attendance rate from DB
      let overallPresent = 0;
      let overallTotal = 0;
      allAttendanceSessions.forEach((s) => {
        s.records.forEach((r) => {
          overallTotal++;
          if (r.status === 'Present') overallPresent++;
        });
      });
      todayAttendanceRate = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0;
    }

    // 3. Dynamic Monthly Revenue Chart from real Payment collection
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Group payments by month & year
    const revenueMap: Record<string, number> = {};
    paidPayments.forEach((p) => {
      const d = p.paidAt ? new Date(p.paidAt) : new Date(p.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      revenueMap[key] = (revenueMap[key] || 0) + (p.amount || 0);
    });

    // Build chronological last 6 months revenue array
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonthIndex - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const rev = revenueMap[key] || 0;
      monthlyRevenue.push({
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        revenue: rev,
        target: Math.round(rev * 1.15) || 50000,
      });
    }

    // 4. Calculate actual month-over-month growth from DB
    const currentMonthKey = `${currentYear}-${currentMonthIndex}`;
    const prevMonthDate = new Date(currentYear, currentMonthIndex - 1, 1);
    const prevMonthKey = `${prevMonthDate.getFullYear()}-${prevMonthDate.getMonth()}`;
    const currRev = revenueMap[currentMonthKey] || 0;
    const prevRev = revenueMap[prevMonthKey] || 0;
    let monthlyGrowth = '+0%';
    if (prevRev > 0) {
      const growthPct = (((currRev - prevRev) / prevRev) * 100).toFixed(1);
      monthlyGrowth = `${Number(growthPct) >= 0 ? '+' : ''}${growthPct}%`;
    } else if (currRev > 0) {
      monthlyGrowth = '+100%';
    }

    // 5. Dynamic Enrollment Trend from real Enrollment collection
    const allEnrollments = await Enrollment.find().lean();
    const enrollmentMap: Record<string, number> = {};
    allEnrollments.forEach((e) => {
      const d = e.enrolledAt ? new Date(e.enrolledAt) : new Date(e.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      enrollmentMap[key] = (enrollmentMap[key] || 0) + 1;
    });

    const enrollmentTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonthIndex - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const count = enrollmentMap[key] || 0;
      enrollmentTrend.push({
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        enrolled: count,
        dropped: 0,
      });
    }

    // 6. Dynamic Weekly Attendance Trend from real Attendance sessions
    const recentSessions = allAttendanceSessions.slice(0, 7).reverse();
    const attendanceTrend = recentSessions.map((s) => {
      let present = 0;
      let absent = 0;
      s.records.forEach((r) => {
        if (r.status === 'Present') present++;
        else absent++;
      });
      const total = present + absent;
      const d = new Date(s.date);
      const dayName = isNaN(d.getTime()) ? s.date : d.toLocaleDateString('en-US', { weekday: 'short' });

      return {
        day: dayName,
        date: s.date,
        present: total > 0 ? Math.round((present / total) * 100) : 0,
        absent: total > 0 ? Math.round((absent / total) * 100) : 0,
        presentCount: present,
        absentCount: absent,
      };
    });

    sendResponse(res, 200, 'Admin analytics retrieved directly from database', {
      stats: {
        totalStudents,
        totalTeachers,
        totalBatches,
        activeBatches,
        totalRevenue,
        pendingFees,
        todayAttendanceRate,
        monthlyGrowth,
      },
      charts: {
        revenue: monthlyRevenue,
        enrollment: enrollmentTrend,
        attendance: attendanceTrend,
      },
      recentPayments: recentPaymentsList.map((p) => ({
        id: p.receiptNumber || p._id,
        student: (p.student as any)?.name || 'Student',
        batch: (p.batch as any)?.name || 'Course',
        amount: p.amount,
        status: p.status === 'paid' ? 'Completed' : p.status === 'created' ? 'Pending' : 'Failed',
        date: p.paidAt
          ? new Date(p.paidAt).toISOString().split('T')[0]
          : new Date(p.createdAt).toISOString().split('T')[0],
      })),
      pinnedNotices: recentNotices.map((n) => ({
        id: n._id,
        title: n.title,
        content: n.body,
        date: new Date(n.createdAt).toLocaleDateString('en-IN'),
        pinned: n.pinned,
        category: n.category,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getTeacherStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teacherId = req.user!.id;

    const batches = await Batch.find({ teacher: teacherId, status: { $ne: 'archived' } }).lean();
    const batchIds = batches.map((b) => b._id);

    const [enrollments, recentNotices, attendanceSessions] = await Promise.all([
      Enrollment.find({ batch: { $in: batchIds }, isActive: true }).populate('student', 'name email').lean(),
      Notice.find({
        $or: [{ batch: null }, { batch: { $in: batchIds } }],
      })
        .sort({ pinned: -1, createdAt: -1 })
        .limit(4)
        .lean(),
      Attendance.find({ batch: { $in: batchIds } })
        .sort({ date: -1 })
        .limit(5)
        .populate('batch', 'name')
        .lean(),
    ]);

    const totalStudents = new Set(enrollments.map((e) => e.student?._id?.toString())).size;

    // Check today's scheduled classes from real scheduleDays
    const todayWeekday = new Date().toLocaleDateString('en-US', { weekday: 'short' }); // e.g. "Wed"
    const todayClassesCount = batches.filter((b) =>
      b.scheduleDays && b.scheduleDays.some((day) => day.toLowerCase().includes(todayWeekday.toLowerCase()))
    ).length;

    // Calculate attendance percentage for this teacher's sessions
    let teacherPresent = 0;
    let teacherTotal = 0;
    attendanceSessions.forEach((s) => {
      s.records.forEach((r) => {
        teacherTotal++;
        if (r.status === 'Present') teacherPresent++;
      });
    });
    const attendanceHealth = teacherTotal > 0 ? `${((teacherPresent / teacherTotal) * 100).toFixed(1)}%` : '100%';

    sendResponse(res, 200, 'Teacher dashboard stats retrieved', {
      assignedBatchesCount: batches.length,
      totalStudents,
      todayClassesCount,
      attendanceHealth,
      batches: batches.map((b) => ({
        id: b._id,
        name: b.name,
        subject: b.subject,
        schedule: `${b.scheduleDays?.join(', ') || ''} · ${b.startTime} - ${b.endTime}`,
        status: b.status,
      })),
      recentNotices: recentNotices.map((n) => ({
        id: n._id,
        title: n.title,
        content: n.body,
        category: n.category,
        date: new Date(n.createdAt).toLocaleDateString('en-IN'),
      })),
      recentAttendance: attendanceSessions.map((a) => ({
        id: a._id,
        batch: (a.batch as any)?.name || 'Batch',
        date: a.date,
        totalMarked: a.records.length,
        presentCount: a.records.filter((r) => r.status === 'Present').length,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = req.user!.id;

    const [enrollments, payments, notices, attendanceSessions] = await Promise.all([
      Enrollment.find({ student: studentId, isActive: true })
        .populate({
          path: 'batch',
          populate: { path: 'teacher', select: 'name email avatar' },
        })
        .lean(),
      Payment.find({ student: studentId }).populate('batch', 'name').sort({ createdAt: -1 }).lean(),
      Notice.find().sort({ pinned: -1, createdAt: -1 }).limit(4).lean(),
      Attendance.find({ 'records.student': studentId }).populate('batch', 'name scheduleDays startTime endTime').lean(),
    ]);

    let present = 0;
    let total = 0;
    attendanceSessions.forEach((s) => {
      const rec = s.records.find((r) => r.student.toString() === studentId);
      if (rec) {
        total++;
        if (rec.status === 'Present') present++;
      }
    });

    const attendanceRate = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 100;
    const pendingFeesCount = enrollments.filter((e) => e.paymentStatus === 'pending').length;

    // Determine upcoming class
    const nextClassBatch = enrollments[0]?.batch as any;
    const nextClassText = nextClassBatch
      ? `${nextClassBatch.name} (${nextClassBatch.startTime || 'Scheduled'})`
      : 'No classes scheduled';

    sendResponse(res, 200, 'Student dashboard stats retrieved', {
      myBatchesCount: enrollments.length,
      attendancePercentage: attendanceRate,
      presentSessions: present,
      totalSessions: total,
      pendingFeesCount,
      nextClassText,
      enrolledBatches: enrollments.map((e) => ({
        id: (e.batch as any)?._id,
        name: (e.batch as any)?.name,
        subject: (e.batch as any)?.subject,
        teacher: ((e.batch as any)?.teacher as any)?.name || 'Instructor',
        schedule: `${(e.batch as any)?.scheduleDays?.join(', ')} · ${(e.batch as any)?.startTime}`,
        fee: (e.batch as any)?.fee,
        paymentStatus: e.paymentStatus,
        enrollmentId: e._id,
      })),
      recentPayments: payments.slice(0, 4).map((p) => ({
        id: p.receiptNumber || p._id,
        batchName: (p.batch as any)?.name || 'Course Fee',
        amount: p.amount,
        status: p.status === 'paid' ? 'Completed' : 'Pending',
        date: p.paidAt
          ? new Date(p.paidAt).toISOString().split('T')[0]
          : new Date(p.createdAt).toISOString().split('T')[0],
      })),
      notices: notices.map((n) => ({
        id: n._id,
        title: n.title,
        content: n.body,
        category: n.category,
        date: new Date(n.createdAt).toLocaleDateString('en-IN'),
      })),
    });
  } catch (error) {
    next(error);
  }
};
