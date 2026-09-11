import { Router } from 'express';
import authRoutes from './auth.routes.js';
import batchRoutes from './batch.routes.js';
import enrollmentRoutes from './enrollment.routes.js';
import paymentRoutes from './payment.routes.js';
import attendanceRoutes from './attendance.routes.js';
import noticeRoutes from './notice.routes.js';
import profileRoutes from './profile.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/batches', batchRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/payments', paymentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/notices', noticeRoutes);
router.use('/profile', profileRoutes);
router.use('/analytics', analyticsRoutes);

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EduBatch API Server',
    version: '1.0.0',
  });
});

export default router;
