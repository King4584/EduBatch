import { Router } from 'express';
import {
  enrollStudent,
  getEnrollments,
  getMyEnrollments,
  cancelEnrollment,
} from '../controllers/enrollment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createEnrollmentSchema } from '../validators/enrollment.schema.js';

const router = Router();

router.post('/', authenticate, authorize(['admin']), validate(createEnrollmentSchema), enrollStudent);
router.get('/', authenticate, authorize(['admin', 'teacher']), getEnrollments);
router.get('/my', authenticate, authorize(['student']), getMyEnrollments);
router.delete('/:id', authenticate, authorize(['admin']), cancelEnrollment);

export default router;
