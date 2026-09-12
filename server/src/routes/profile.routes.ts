import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
} from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/auth.schema.js';

const router = Router();

router.get('/', authenticate, getProfile);
router.put('/', authenticate, validate(updateProfileSchema), updateProfile);
router.put('/password', authenticate, validate(changePasswordSchema), changePassword);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);
router.put('/change-password', authenticate, validate(changePasswordSchema), changePassword);
router.get('/users', authenticate, authorize(['admin', 'teacher']), getUsers);

export default router;
