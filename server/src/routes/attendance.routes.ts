import { Router } from 'express';
import {
  markAttendance,
  getBatchAttendance,
  getMyAttendance,
  getStudentAttendance,
} from '../controllers/attendance.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { markAttendanceSchema } from '../validators/attendance.schema.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(['admin', 'teacher']),
  validate(markAttendanceSchema),
  markAttendance
);
router.get('/batch/:id', authenticate, getBatchAttendance);
router.get('/:id', authenticate, getBatchAttendance);
router.get('/my', authenticate, authorize(['student']), getMyAttendance);
router.get('/student/:studentId', authenticate, getStudentAttendance);

export default router;
