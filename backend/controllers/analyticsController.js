import { Alert } from '../models/Alert.js';
import { Contact } from '../models/Contact.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get safety analytics and emergency incident metrics
// @route   GET /api/analytics/summary
// @access  Private
export const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Alert counts
  const totalAlerts = await Alert.countDocuments({ user: userId });
  const activeAlerts = await Alert.countDocuments({ user: userId, status: 'active' });
  const resolvedAlerts = await Alert.countDocuments({ user: userId, status: 'resolved' });
  const cancelledAlerts = await Alert.countDocuments({ user: userId, status: 'cancelled' });

  // 2. Trigger types breakdown
  const triggerStats = await Alert.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$triggerType', count: { $sum: 1 } } },
  ]);

  const triggerBreakdown = {
    manual_sos: 0,
    voice_keyword: 0,
    scream_detected: 0,
    fall_detected: 0,
    test_alert: 0,
  };

  triggerStats.forEach((stat) => {
    if (triggerBreakdown[stat._id] !== undefined) {
      triggerBreakdown[stat._id] = stat.count;
    }
  });

  // 3. Last 7 days alerts trend
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dailyAlerts = await Alert.aggregate([
    {
      $match: {
        user: userId,
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill in all 7 days even if 0 alerts
  const last7Days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const match = dailyAlerts.find((item) => item._id === dateStr);
    last7Days.push({
      date: dateStr,
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      count: match ? match.count : 0,
    });
  }

  // 4. Contact & preparedness health score (0 - 100)
  const contactsCount = await Contact.countDocuments({ user: userId });
  let preparednessScore = 20; // baseline

  if (contactsCount >= 1) preparednessScore += 25;
  if (contactsCount >= 3) preparednessScore += 15;
  if (req.user.emergencyPin && req.user.emergencyPin !== '1234') preparednessScore += 15;
  if (req.user.settings?.telegramAlertsEnabled) preparednessScore += 15;
  if (req.user.settings?.autoRecordAudio) preparednessScore += 10;

  res.json({
    success: true,
    analytics: {
      totalAlerts,
      activeAlerts,
      resolvedAlerts,
      cancelledAlerts,
      triggerBreakdown,
      last7Days,
      contactsCount,
      preparednessScore: Math.min(100, preparednessScore),
    },
  });
});
