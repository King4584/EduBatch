import { Router } from 'express';
import {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  updateBatchStatus,
  getTeacherBatches,
} from '../controllers/batch.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createBatchSchema,
  updateBatchSchema,
  updateBatchStatusSchema,
} from '../validators/batch.schema.js';

const router = Router();

// Public / Authenticated read
router.get('/', authenticate, getBatches);
router.get('/teacher/my-batches', authenticate, authorize(['teacher', 'admin']), getTeacherBatches);
router.get('/:id', authenticate, getBatchById);

// Admin only mutations
router.post('/', authenticate, authorize(['admin']), validate(createBatchSchema), createBatch);
router.put('/:id', authenticate, authorize(['admin']), validate(updateBatchSchema), updateBatch);
router.delete('/:id', authenticate, authorize(['admin']), deleteBatch);
router.patch('/:id/status', authenticate, authorize(['admin']), validate(updateBatchStatusSchema), updateBatchStatus);

export default router;
