import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    triggerType: {
      type: String,
      enum: ['voice_keyword', 'scream_detected', 'manual_sos', 'fall_detected', 'test_alert'],
      default: 'manual_sos',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'resolved'],
      default: 'active',
      index: true,
    },
    keywordTriggered: {
      type: String,
      default: '',
    },
    audioDecibels: {
      type: Number,
      default: null,
    },
    location: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      accuracy: {
        type: Number,
        default: null,
      },
      address: {
        type: String,
        default: 'Location fetching...',
      },
      mapsUrl: {
        type: String,
        default: '',
      },
    },
    audioEvidence: [
      {
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        mimeType: String,
        duration: Number,
        recordedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    timeline: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
    recipientsNotified: [
      {
        contact: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Contact',
        },
        name: String,
        phone: String,
        telegramChatId: String,
        method: {
          type: String,
          default: 'telegram',
        },
        status: {
          type: String,
          enum: ['sent', 'simulated', 'failed'],
          default: 'sent',
        },
        error: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    cancelReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Alert = mongoose.model('Alert', alertSchema);
