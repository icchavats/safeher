import express from 'express';
import {
  triggerAlert,
  cancelAlert,
  getActiveAlert,
  getIncomingAlerts,
  getAlertHistory,
  getAlertById,
  resolveAlert,
} from '../controllers/alertController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All alert routes require auth

router.post('/trigger', triggerAlert);
router.get('/active', getActiveAlert);
router.get('/incoming', getIncomingAlerts);
router.get('/', getAlertHistory);
router.get('/:id', getAlertById);
router.post('/:id/cancel', cancelAlert);
router.patch('/:id/resolve', resolveAlert);

export default router;
