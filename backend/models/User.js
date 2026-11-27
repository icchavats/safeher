import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a contact phone number'],
      trim: true,
    },
    emergencyPin: {
      type: String,
      default: '1234',
      trim: true,
    },
    safetyPhrase: {
      type: String,
      default: 'I am safe now',
      trim: true,
    },
    settings: {
      audioSensitivity: {
        type: Number,
        default: 75, // 0 - 100%
      },
      keywords: {
        type: [String],
        default: ['help', 'bachao', 'save me', 'emergency', 'danger', 'police'],
      },
      autoRecordAudio: {
        type: Boolean,
        default: true,
      },
      telegramAlertsEnabled: {
        type: Boolean,
        default: true,
      },
      defaultTelegramChatId: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Compare emergency PIN
userSchema.methods.matchPin = function (enteredPin) {
  return String(this.emergencyPin).trim() === String(enteredPin).trim();
};

export const User = mongoose.model('User', userSchema);
