import { env } from '../config/env.js';
import fs from 'fs';

/**
 * Service to dispatch emergency SOS alerts and audio recordings via Telegram Bot API
 */
export const telegramService = {
  /**
   * Check if Telegram service is configured with valid token
   */
  isConfigured() {
    return Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_BOT_TOKEN.trim().length > 10);
  },

  /**
   * Send an emergency alert message to a specific Telegram Chat ID or the default channel
   */
  async sendEmergencyAlert({ chatId, alertData, userName, userPhone }) {
    const targetChatId = chatId || alertData.telegramChatId || env.TELEGRAM_DEFAULT_CHAT_ID;

    const triggerLabel = {
      voice_keyword: '🎙️ Voice Distress Keyword Detected',
      scream_detected: '📢 Loud Scream / High Decibel Distress',
      manual_sos: '🚨 Manual SOS Panic Button Triggered',
      fall_detected: '⚠️ Sudden Impact / Fall Detected',
      test_alert: '🧪 Test Safety Alert Verification',
    }[alertData.triggerType] || '🚨 Emergency SOS Triggered';

    const timeString = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });

    const mapsUrl = alertData.location?.mapsUrl || 
      (alertData.location?.latitude && alertData.location?.longitude
        ? `https://www.google.com/maps?q=${alertData.location.latitude},${alertData.location.longitude}`
        : 'Not Available');

    const messageText = `
🚨 *EMERGENCY SOS ALERT - SAFEHER / SAFEVOICE* 🚨
━━━━━━━━━━━━━━━━━━━━━
*Trigger:* ${triggerLabel}
*Time:* ${timeString}
*User in Need:* ${userName || 'Registered SafeVoice User'}
*Phone Number:* ${userPhone || 'N/A'}

📍 *LIVE LOCATION:*
${alertData.location?.address || 'Current coordinates acquired'}
${alertData.location?.latitude && alertData.location?.longitude ? `\`Coordinates: ${alertData.location.latitude.toFixed(5)}, ${alertData.location.longitude.toFixed(5)}\`` : ''}

🔗 *Track Location on Maps:*
[Click to Open Google Maps](${mapsUrl})

${alertData.keywordTriggered ? `*Detected Word:* "${alertData.keywordTriggered}"\n` : ''}
${alertData.audioDecibels ? `*Sound Level:* ${alertData.audioDecibels} dB\n` : ''}
━━━━━━━━━━━━━━━━━━━━━
*IMMEDIATE ACTION REQUIRED:*
1. Try contacting the user immediately.
2. Check live location link above.
3. If unreachable, alert local emergency authorities (Helpline: 112).
`.trim();

    if (!this.isConfigured() || !targetChatId) {
      console.log('[SafeVoice Telegram Service (Simulated Dispatch)]');
      console.log(`To Chat ID: ${targetChatId || 'Not Configured (Demo Mode)'}`);
      console.log(messageText);
      return {
        success: true,
        simulated: true,
        note: 'Telegram token not set or chat ID omitted; alert simulated in console.',
      };
    }

    try {
      const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: messageText,
          parse_mode: 'Markdown',
          disable_web_page_preview: false,
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.description || 'Failed to dispatch Telegram message');
      }

      return {
        success: true,
        simulated: false,
        messageId: data.result?.message_id,
      };
    } catch (error) {
      console.error('[SafeVoice Telegram Service Error]:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Send alert cancellation update to notify contacts that user is safe
   */
  async sendSafeCancellation({ chatId, userName, userPhone, reason }) {
    const targetChatId = chatId || env.TELEGRAM_DEFAULT_CHAT_ID;
    if (!this.isConfigured() || !targetChatId) {
      return { success: true, simulated: true };
    }

    const messageText = `
✅ *ALERT CANCELLED - USER IS SAFE* ✅
━━━━━━━━━━━━━━━━━━━━━
*User:* ${userName} (${userPhone})
*Status:* Alert cancelled with verified PIN.
*Reason / Note:* ${reason || 'User confirmed they are in a safe environment.'}
*Time:* ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━━
`.trim();

    try {
      const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: messageText,
          parse_mode: 'Markdown',
        }),
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Send audio evidence recording to Telegram
   */
  async sendAudioEvidence({ chatId, filePath, caption }) {
    const targetChatId = chatId || env.TELEGRAM_DEFAULT_CHAT_ID;
    if (!this.isConfigured() || !targetChatId || !fs.existsSync(filePath)) {
      return { success: true, simulated: true };
    }

    try {
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new Blob([fileBuffer]);
      formData.append('chat_id', targetChatId);
      formData.append('audio', blob, 'evidence.webm');
      if (caption) formData.append('caption', caption);

      const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendAudio`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return { success: data.ok };
    } catch (err) {
      console.error('[SafeVoice Telegram Audio Error]:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Test Telegram connection with a test message
   */
  async testConnection(chatId) {
    if (!this.isConfigured()) {
      return {
        success: false,
        configured: false,
        message: 'TELEGRAM_BOT_TOKEN is not configured in backend/.env',
      };
    }

    const targetChat = chatId || env.TELEGRAM_DEFAULT_CHAT_ID;
    if (!targetChat) {
      return {
        success: false,
        configured: true,
        message: 'No Telegram Chat ID provided to test with.',
      };
    }

    try {
      const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChat,
          text: '🛡️ *SafeVoice Test Notification*: Your Telegram emergency alert channel is linked and active!',
          parse_mode: 'Markdown',
        }),
      });
      const data = await response.json();
      return {
        success: data.ok,
        configured: true,
        details: data,
      };
    } catch (error) {
      return {
        success: false,
        configured: true,
        error: error.message,
      };
    }
  },
};
