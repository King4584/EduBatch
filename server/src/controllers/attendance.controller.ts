import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { Attendance, AttendanceStatus } from '../models/Attendance.js';
import { Batch } from '../models/Batch.js';
import { Enrollment } from '../models/Enrollment.js';
import { ApiError } from '../utils/apiError.js';
import { sendResponse } from '../utils/apiResponse.js';

export const markAttendance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { batchId, date, records } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      throw ApiError.notFound('Batch not found');
    }

    // Teacher check: must be assigned teacher unless admin
    if (req.user?.role === 'teacher' && batch.teacher.toString() !== req.user.id) {
      throw ApiError.forbidden('You can only mark attendance for your assigned batches');
    }

    // Upsert attendance document for batch and date
    const attendance = await Attendance.findOneAndUpdate(
      { batch: batchId, date },
      {
        batch: batchId,
        date,
        records,
        markedBy: req.user!.id,
      },
      { new: true, upsert: true, runValidators: true }
    ).populate('records.student', 'name email phone avatar');

    sendResponse(res, 200, 'Attendance saved successfully', attendance);
  } catch (error) {
    next(error);
  }
};

export const getBatchAttendance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, startDate, endDate } = req.query;

    const query: any = { batch: id };
    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendanceSessions = await Attendance.find(query)
      .populate('records.student', 'name email avatar')
      .populate('markedBy', 'name role')
      .sort({ date: -1 })
      .lean();

    // Compute cumulative statistics per student in this batch
    const studentStats: Record<string, { student: any; present: number; absent: number; late: number; total: number }> = {};

    attendanceSessions.forEach((session) => {
      session.records.forEach((rec) => {
        const studentObj = rec.student as any;
        if (!studentObj?._id) return;
        const sId = studentObj._id.toString();
        if (!studentStats[sId]) {
          studentStats[sId] = {
            student: studentObj,
            present: 0,
            absent: 0,
            late: 0,
            total: 0,
          };
        }
        studentStats[sId].total += 1;
        if (rec.status === 'Present') studentStats[sId].present += 1;
        else if (rec.status === 'Absent') studentStats[sId].absent += 1;
        else if (rec.status === 'Late') studentStats[sId].late += 1;
      });
    });

    const studentRecords = Object.values(studentStats).map((s) => ({
      studentId: s.student._id,
      student: s.student.name,
      present: s.present,
      absent: s.absent,
      late: s.late,
      total: s.total,
      percentage: s.total > 0 ? Number(((s.present / s.total) * 100).toFixed(1)) : 100,
    }));

    const totalSessions = attendanceSessions.length;
    const avgPresence = studentRecords.length > 0
      ? Number((studentRecords.reduce((acc, s) => acc + s.percentage, 0) / studentRecords.length).toFixed(1))
      : 100;
    const under75Count = studentRecords.filter((s) => s.percentage < 75).length;

    sendResponse(res, 200, 'Batch attendance retrieved', {
      sessions: attendanceSessions,
      studentRecords,
      summary: {
        totalSessions,
        avgPresence,
        under75Count,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = req.user!.id;

    // Find all active enrollments for this student
    const enrollments = await Enrollment.find({ student: studentId, isActive: true })
      .populate('batch', 'name subject scheduleDays startTime endTime')
      .lean();

    const batchIds = enrollments.map((e) => e.batch?._id).filter(Boolean);

    // Fetch all attendance documents containing this student in records
    const attendanceRecords = await Attendance.find({
      batch: { $in: batchIds },
      'records.student': studentId,
    })
      .populate('batch', 'name subject')
      .sort({ date: -1 })
      .lean();

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    const history = attendanceRecords.map((session) => {
      const myRecord = session.records.find((r) => r.student.toString() === studentId);
      const status: AttendanceStatus = myRecord?.status || 'Absent';

      if (status === 'Present') presentCount++;
      else if (status === 'Absent') absentCount++;
      else if (status === 'Late') lateCount++;

      return {
        id: session._id,
        date: session.date,
        batchName: (session.batch as any)?.name || 'General',
        status,
        remarks: myRecord?.remarks || '',
      };
    });

    const totalSessions = presentCount + absentCount + lateCount;
    const attendancePercentage = totalSessions > 0
      ? Number(((presentCount / totalSessions) * 100).toFixed(1))
      : 100;

    sendResponse(res, 200, 'My attendance summary retrieved', {
      attendancePercentage,
      presentCount,
      absentCount,
      lateCount,
      totalSessions,
      history,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentAttendance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = req.params.studentId;
    if (req.user?.role === 'student' && req.user.id !== studentId) {
      throw ApiError.forbidden('You can only view your own attendance');
    }

    const enrollments = await Enrollment.find({ student: studentId, isActive: true })
      .populate('batch', 'name subject scheduleDays startTime endTime')
      .lean();

    const batchIds = enrollments.map((e) => e.batch?._id).filter(Boolean);

    const attendanceRecords = await Attendance.find({
      batch: { $in: batchIds },
      'records.student': studentId,
    })
      .populate('batch', 'name subject')
      .sort({ date: -1 })
      .lean();

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    const history = attendanceRecords.map((session) => {
      const myRecord = session.records.find((r) => r.student.toString() === studentId);
      const status: AttendanceStatus = myRecord?.status || 'Absent';

      if (status === 'Present') presentCount++;
      else if (status === 'Absent') absentCount++;
      else if (status === 'Late') lateCount++;

      return {
        id: session._id,
        date: session.date,
        batchName: (session.batch as any)?.name || 'General',
        status,
        remarks: myRecord?.remarks || '',
      };
    });

    const totalSessions = presentCount + absentCount + lateCount;
    const attendancePercentage = totalSessions > 0
      ? Number(((presentCount / totalSessions) * 100).toFixed(1))
      : 100;

    sendResponse(res, 200, 'Student attendance summary retrieved', {
      studentId,
      attendancePercentage,
      presentCount,
      absentCount,
      lateCount,
      totalSessions,
      history,
    });
  } catch (error) {
    next(error);
  }
};

