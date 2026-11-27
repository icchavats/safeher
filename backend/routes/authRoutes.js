import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  updateEmergencyPin,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/pin', protect, updateEmergencyPin);

export default router;
