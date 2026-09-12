import { Router } from 'express';
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/notice.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createNoticeSchema, updateNoticeSchema } from '../validators/notice.schema.js';

const router = Router();

router.get('/', authenticate, getNotices);
router.get('/batch/:batchId', authenticate, getNotices);
router.post(
  '/',
  authenticate,
  authorize(['admin', 'teacher']),
  validate(createNoticeSchema),
  createNotice
);
router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'teacher']),
  validate(updateNoticeSchema),
  updateNotice
);
router.delete('/:id', authenticate, authorize(['admin', 'teacher']), deleteNotice);

export default router;
