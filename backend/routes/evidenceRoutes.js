import express from 'express';
import {
  uploadEvidence,
  getEvidenceByAlertId,
  streamEvidence,
} from '../controllers/evidenceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('evidenceAudio'), uploadEvidence);
router.get('/:alertId', getEvidenceByAlertId);
router.get('/stream/:filename', streamEvidence);

export default router;
