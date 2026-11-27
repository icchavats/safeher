import path from 'path';
import fs from 'fs';
import { Alert } from '../models/Alert.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Upload audio evidence file for an alert
// @route   POST /api/evidence/upload
// @access  Private
export const uploadEvidence = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No audio evidence file uploaded',
    });
  }

  const { alertId, duration } = req.body;

  let alert;
  if (alertId) {
    alert = await Alert.findOne({ _id: alertId, user: req.user._id });
  } else {
    // Find active alert or most recent alert
    alert = await Alert.findOne({ user: req.user._id, status: 'active' }).sort({ createdAt: -1 });
    if (!alert) {
      alert = await Alert.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    }
  }

  if (!alert) {
    return res.status(404).json({
      success: false,
      message: 'No associated emergency alert found to attach evidence to',
    });
  }

  const evidenceRecord = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: `/uploads/evidence/${req.file.filename}`,
    size: req.file.size,
    mimeType: req.file.mimetype,
    duration: duration ? Number(duration) : null,
    recordedAt: new Date(),
  };

  alert.audioEvidence.push(evidenceRecord);
  alert.timeline.push({
    status: alert.status,
    timestamp: new Date(),
    note: `Audio evidence recording attached (${(req.file.size / 1024).toFixed(1)} KB)`,
  });

  await alert.save();

  res.status(201).json({
    success: true,
    message: 'Audio evidence uploaded and linked to emergency alert',
    evidence: evidenceRecord,
    alertId: alert._id,
  });
});

// @desc    Get evidence files for an alert
// @route   GET /api/evidence/:alertId
// @access  Private
export const getEvidenceByAlertId = asyncHandler(async (req, res) => {
  const alert = await Alert.findOne({ _id: req.params.alertId, user: req.user._id });
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }

  res.json({
    success: true,
    evidence: alert.audioEvidence,
  });
});

// @desc    Stream or download audio evidence file
// @route   GET /api/evidence/stream/:filename
// @access  Private
export const streamEvidence = asyncHandler(async (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.resolve('uploads/evidence', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Audio file not found' });
  }

  res.sendFile(filePath);
});
