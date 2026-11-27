import { Alert } from '../models/Alert.js';
import { Contact } from '../models/Contact.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateMapsLink } from '../utils/mapsLink.js';
import { locationService } from '../services/locationService.js';
import { findRegisteredUserForContact, normalizePhoneDigits } from '../utils/matchUser.js';

// @desc    Trigger an emergency SOS alert
// @route   POST /api/alerts/trigger
// @access  Private
export const triggerAlert = asyncHandler(async (req, res) => {
  const { triggerType, keywordTriggered, audioDecibels, location } = req.body;

  let address = 'Location unavailable';
  let mapsUrl = '';
  const lat = location?.latitude;
  const lon = location?.longitude;
  const accuracy = location?.accuracy;

  if (lat && lon) {
    mapsUrl = generateMapsLink(lat, lon);
    address = await locationService.reverseGeocode(lat, lon);
  }

  // Create alert record
  const alert = await Alert.create({
    user: req.user._id,
    triggerType: triggerType || 'manual_sos',
    keywordTriggered: keywordTriggered || '',
    audioDecibels: audioDecibels || null,
    location: {
      latitude: lat || null,
      longitude: lon || null,
      accuracy: accuracy || null,
      address,
      mapsUrl,
    },
    timeline: [
      {
        status: 'active',
        timestamp: new Date(),
        note: `SOS triggered via ${triggerType || 'manual_sos'}${keywordTriggered ? ` ("${keywordTriggered}")` : ''}`,
      },
    ],
  });

  // Fetch emergency contacts for this user
  const contacts = await Contact.find({
    user: req.user._id,
    isEmergencyContact: true,
  }).sort({ priority: 1 });

  const notifications = [];

  // Dispatch in-app SOS alert to all registered emergency contacts
  for (const contact of contacts) {
    let recipientUserId = contact.linkedUser || null;
    let recipientEmail = contact.email || '';

    if (!recipientUserId) {
      const matchedUser = await findRegisteredUserForContact({
        email: contact.email,
        phone: contact.phone,
        excludeUserId: req.user._id,
      });
      if (matchedUser) {
        recipientUserId = matchedUser._id;
        recipientEmail = matchedUser.email || recipientEmail;
        contact.linkedUser = matchedUser._id;
        await contact.save();
      }
    }

    notifications.push({
      contact: contact._id,
      recipientUser: recipientUserId,
      name: contact.name,
      phone: contact.phone,
      email: recipientEmail,
      method: 'webapp',
      status: recipientUserId ? 'sent' : 'unregistered',
      timestamp: new Date(),
    });
  }

  alert.recipientsNotified = notifications;
  await alert.save();

  res.status(201).json({
    success: true,
    message: 'Emergency SOS alert dispatched to your registered contacts',
    alert,
  });
});

// @desc    Cancel an active emergency alert using PIN or safety phrase
// @route   POST /api/alerts/:id/cancel
// @access  Private
export const cancelAlert = asyncHandler(async (req, res) => {
  const { pin, phrase, reason } = req.body;
  const alert = await Alert.findOne({ _id: req.params.id, user: req.user._id });

  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }

  if (alert.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: `Alert is already marked as ${alert.status}`,
    });
  }

  // Verify PIN or Safety Phrase
  const pinValid = pin && req.user.matchPin(pin);
  const phraseValid = phrase && phrase.trim().toLowerCase() === (req.user.safetyPhrase || '').trim().toLowerCase();

  if (!pinValid && !phraseValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid cancellation PIN or safety phrase. Cancellation rejected for your safety.',
    });
  }

  alert.status = 'cancelled';
  alert.cancelledAt = new Date();
  alert.cancelReason = reason || (pinValid ? 'Verified with Emergency PIN' : 'Verified with Safety Phrase');
  alert.timeline.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: `Alert cancelled by user. Reason: ${alert.cancelReason}`,
  });

  await alert.save();

  res.json({
    success: true,
    message: 'Alert has been safely cancelled. Your contacts have been notified.',
    alert,
  });
});

// @desc    Get active incoming SOS alerts where current user is a saved emergency contact
// @route   GET /api/alerts/incoming
// @access  Private
export const getIncomingAlerts = asyncHandler(async (req, res) => {
  const recipientFilters = [{ 'recipientsNotified.recipientUser': req.user._id }];

  if (req.user.email) {
    recipientFilters.push({ 'recipientsNotified.email': req.user.email.toLowerCase() });
  }

  if (req.user.phone) {
    recipientFilters.push({ 'recipientsNotified.phone': req.user.phone });
    const digits = normalizePhoneDigits(req.user.phone);
    if (digits.length >= 10) {
      recipientFilters.push({ 'recipientsNotified.phone': { $regex: `${digits.slice(-10)}$` } });
    }
  }

  const incomingAlerts = await Alert.find({
    status: 'active',
    user: { $ne: req.user._id },
    $or: recipientFilters,
  })
    .populate('user', 'name phone email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: incomingAlerts.length,
    alerts: incomingAlerts,
  });
});

// @desc    Get currently active alert for user
// @route   GET /api/alerts/active
// @access  Private
export const getActiveAlert = asyncHandler(async (req, res) => {
  const activeAlert = await Alert.findOne({
    user: req.user._id,
    status: 'active',
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    hasActiveAlert: Boolean(activeAlert),
    alert: activeAlert || null,
  });
});

// @desc    Get alert history
// @route   GET /api/alerts
// @access  Private
export const getAlertHistory = asyncHandler(async (req, res) => {
  const { status, limit = 20, page = 1 } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const total = await Alert.countDocuments(filter);
  const alerts = await Alert.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    success: true,
    total,
    page: Number(page),
    alerts,
  });
});

// @desc    Get single alert by ID
// @route   GET /api/alerts/:id
// @access  Private
export const getAlertById = asyncHandler(async (req, res) => {
  const alert = await Alert.findOne({ _id: req.params.id, user: req.user._id });
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }

  res.json({
    success: true,
    alert,
  });
});

// @desc    Update alert status (e.g. resolve)
// @route   PATCH /api/alerts/:id/resolve
// @access  Private
export const resolveAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findOne({ _id: req.params.id, user: req.user._id });
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }

  alert.status = 'resolved';
  alert.resolvedAt = new Date();
  alert.timeline.push({
    status: 'resolved',
    timestamp: new Date(),
    note: req.body.note || 'Emergency incident marked as resolved.',
  });

  await alert.save();

  res.json({
    success: true,
    message: 'Alert marked as resolved',
    alert,
  });
});
