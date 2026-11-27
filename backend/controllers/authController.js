import { User } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, emergencyPin, safetyPhrase } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email address already exists',
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    emergencyPin: emergencyPin || '1234',
    safetyPhrase: safetyPhrase || 'I am safe now',
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      emergencyPin: user.emergencyPin,
      safetyPhrase: user.safetyPhrase,
      settings: user.settings,
    },
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password credentials',
    });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      emergencyPin: user.emergencyPin,
      safetyPhrase: user.safetyPhrase,
      settings: user.settings,
    },
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      emergencyPin: user.emergencyPin,
      safetyPhrase: user.safetyPhrase,
      settings: user.settings,
    },
  });
});

// @desc    Update user profile and safety settings
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { name, phone, safetyPhrase, settings } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (safetyPhrase) user.safetyPhrase = safetyPhrase;
  if (settings) {
    user.settings = {
      ...user.settings.toObject(),
      ...settings,
    };
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile and safety preferences updated',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      emergencyPin: user.emergencyPin,
      safetyPhrase: user.safetyPhrase,
      settings: user.settings,
    },
  });
});

// @desc    Update emergency PIN
// @route   PUT /api/auth/pin
// @access  Private
export const updateEmergencyPin = asyncHandler(async (req, res) => {
  const { currentPassword, newPin } = req.body;

  if (!newPin || newPin.length < 4) {
    return res.status(400).json({
      success: false,
      message: 'New PIN must be at least 4 digits',
    });
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.matchPassword(currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect account password',
    });
  }

  user.emergencyPin = newPin;
  await user.save();

  res.json({
    success: true,
    message: 'Emergency cancellation PIN updated successfully',
  });
});
