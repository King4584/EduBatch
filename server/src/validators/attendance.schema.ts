import { z } from 'zod';

export const markAttendanceSchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  records: z.array(
    z.object({
      student: z.string().min(1, 'Student ID is required'),
      status: z.enum(['Present', 'Absent', 'Late']),
      remarks: z.string().optional(),
    })
  ).min(1, 'At least one student attendance record is required'),
});
