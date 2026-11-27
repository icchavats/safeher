import { Contact } from '../models/Contact.js';
import { Alert } from '../models/Alert.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { findRegisteredUserForContact } from '../utils/matchUser.js';

// @desc    Get all emergency contacts for current user
// @route   GET /api/contacts
// @access  Private
export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ user: req.user._id }).sort({ priority: 1, createdAt: -1 });

  // Enrich with live registration status in case a contact registered after being added
  const enrichedContacts = await Promise.all(
    contacts.map(async (c) => {
      const obj = c.toObject();
      if (!obj.linkedUser) {
        const matched = await findRegisteredUserForContact({
          email: obj.email,
          phone: obj.phone,
          excludeUserId: req.user._id,
        });
        if (matched) {
          obj.linkedUser = matched._id;
          c.linkedUser = matched._id;
          await c.save();
        }
      }
      obj.isRegistered = Boolean(obj.linkedUser);
      return obj;
    })
  );

  res.json({
    success: true,
    count: enrichedContacts.length,
    contacts: enrichedContacts,
  });
});

// @desc    Create a new emergency contact
// @route   POST /api/contacts
// @access  Private
export const createContact = asyncHandler(async (req, res) => {
  const { name, phone, email, relation, priority, isEmergencyContact } = req.body;

  const matchedUser = await findRegisteredUserForContact({
    email,
    phone,
    excludeUserId: req.user._id,
  });

  const contact = await Contact.create({
    user: req.user._id,
    name,
    phone,
    email: email || '',
    relation: relation || 'Family',
    priority: priority || 1,
    isEmergencyContact: isEmergencyContact !== undefined ? isEmergencyContact : true,
    linkedUser: matchedUser ? matchedUser._id : null,
  });

  const contactObj = contact.toObject();
  contactObj.isRegistered = Boolean(matchedUser);

  res.status(201).json({
    success: true,
    message: matchedUser
      ? 'Emergency contact added & linked to their SafeVoice account'
      : 'Emergency contact added (they will receive web alerts once registered)',
    contact: contactObj,
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

  const { name, phone, email, relation, priority, isEmergencyContact } = req.body;

  if (name !== undefined) contact.name = name;
  if (phone !== undefined) contact.phone = phone;
  if (email !== undefined) contact.email = email;
  if (relation !== undefined) contact.relation = relation;
  if (priority !== undefined) contact.priority = priority;
  if (isEmergencyContact !== undefined) contact.isEmergencyContact = isEmergencyContact;

  const matchedUser = await findRegisteredUserForContact({
    email: contact.email,
    phone: contact.phone,
    excludeUserId: req.user._id,
  });
  contact.linkedUser = matchedUser ? matchedUser._id : null;

  await contact.save();

  const contactObj = contact.toObject();
  contactObj.isRegistered = Boolean(matchedUser);

  res.json({
    success: true,
    message: 'Contact updated successfully',
    contact: contactObj,
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

// @desc    Send in-app test SOS alert to a registered contact
// @route   POST /api/contacts/:id/test
// @access  Private
export const testContactAlert = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, user: req.user._id });
  if (!contact) {
    return res.status(404).json({ success: false, message: 'Contact not found' });
  }

  const matchedUser = await findRegisteredUserForContact({
    email: contact.email,
    phone: contact.phone,
    excludeUserId: req.user._id,
  });

  if (!matchedUser) {
    return res.status(400).json({
      success: false,
      message: `${contact.name} is not registered on SafeVoice yet with that phone or email.`,
    });
  }

  if (!contact.linkedUser) {
    contact.linkedUser = matchedUser._id;
    await contact.save();
  }

  const testAlert = await Alert.create({
    user: req.user._id,
    triggerType: 'test_alert',
    location: {
      address: 'Test SOS Verification Alert',
      mapsUrl: '',
    },
    recipientsNotified: [
      {
        contact: contact._id,
        recipientUser: matchedUser._id,
        name: contact.name,
        phone: contact.phone,
        email: matchedUser.email,
        method: 'webapp',
        status: 'sent',
        timestamp: new Date(),
      },
    ],
    timeline: [
      {
        status: 'active',
        timestamp: new Date(),
        note: `In-app Test SOS dispatched to ${contact.name}`,
      },
    ],
  });

  res.json({
    success: true,
    message: `Live Test SOS & siren sent to ${contact.name}'s SafeVoice web app!`,
    alertId: testAlert._id,
  });
});
