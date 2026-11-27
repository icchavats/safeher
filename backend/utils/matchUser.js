import { User } from '../models/User.js';

/**
 * Normalize a phone number to its digits (and last 10 digits for country-code-agnostic matching).
 */
export const normalizePhoneDigits = (phone = '') => String(phone).replace(/\D/g, '');

/**
 * Build a MongoDB query matching a User by email or phone (exact or last-10-digits).
 */
export const findRegisteredUserForContact = async ({ email, phone, excludeUserId = null }) => {
  const orConditions = [];

  if (email && String(email).trim()) {
    orConditions.push({ email: String(email).trim().toLowerCase() });
  }

  const rawPhone = String(phone || '').trim();
  const digits = normalizePhoneDigits(rawPhone);
  if (rawPhone) {
    orConditions.push({ phone: rawPhone });
  }
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    orConditions.push({ phone: { $regex: `${last10}$` } });
  }

  if (orConditions.length === 0) return null;

  const query = { $or: orConditions };
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  return User.findOne(query).select('_id name email phone');
};
