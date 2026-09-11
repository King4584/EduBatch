import { Router } from 'express';
import {
  getAdminStats,
  getTeacherStats,
  getStudentStats,
} from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

router.get('/admin', authenticate, authorize(['admin']), getAdminStats);
router.get('/teacher', authenticate, authorize(['teacher', 'admin']), getTeacherStats);
router.get('/student', authenticate, authorize(['student']), getStudentStats);

export default router;
