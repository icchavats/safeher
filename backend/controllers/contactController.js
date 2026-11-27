import { Contact } from '../models/Contact.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { telegramService } from '../services/telegramService.js';

// @desc    Get all emergency contacts for current user
// @route   GET /api/contacts
// @access  Private
export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ user: req.user._id }).sort({ priority: 1, createdAt: -1 });
  res.json({
    success: true,
    count: contacts.length,
    contacts,
  });
});

// @desc    Create a new emergency contact
// @route   POST /api/contacts
// @access  Private
export const createContact = asyncHandler(async (req, res) => {
  const { name, phone, email, telegramChatId, relation, priority, isEmergencyContact } = req.body;

  const contact = await Contact.create({
    user: req.user._id,
    name,
    phone,
    email: email || '',
    telegramChatId: telegramChatId || '',
    relation: relation || 'Family',
    priority: priority || 1,
    isEmergencyContact: isEmergencyContact !== undefined ? isEmergencyContact : true,
  });

  res.status(201).json({
    success: true,
    message: 'Emergency contact added successfully',
    contact,
  });
});

// @desc    Update contact details
// @route   PUT /api/contacts/:id
// @access  Private
export const updateContact = asyncHandler(async (req, res) => {
  let contact = await Contact.findOne({ _id: req.params.id, user: req.user._id });
  if (!contact) {
    return res.status(404).json({ success: false, message: 'Contact not found' });
  }

  const { name, phone, email, telegramChatId, relation, priority, isEmergencyContact } = req.body;

  if (name !== undefined) contact.name = name;
  if (phone !== undefined) contact.phone = phone;
  if (email !== undefined) contact.email = email;
  if (telegramChatId !== undefined) contact.telegramChatId = telegramChatId;
  if (relation !== undefined) contact.relation = relation;
  if (priority !== undefined) contact.priority = priority;
  if (isEmergencyContact !== undefined) contact.isEmergencyContact = isEmergencyContact;

  await contact.save();

  res.json({
    success: true,
    message: 'Contact updated successfully',
    contact,
  });
});

// @desc    Delete a contact
// @route   DELETE /api/contacts/:id
// @access  Private
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!contact) {
    return res.status(404).json({ success: false, message: 'Contact not found' });
  }

  res.json({
    success: true,
    message: 'Emergency contact removed',
  });
});

// @desc    Send test alert to contact
// @route   POST /api/contacts/:id/test
// @access  Private
export const testContactAlert = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, user: req.user._id });
  if (!contact) {
    return res.status(404).json({ success: false, message: 'Contact not found' });
  }

  const result = await telegramService.testConnection(contact.telegramChatId);

  res.json({
    success: true,
    message: `Test alert dispatched to ${contact.name}`,
    result,
  });
});
