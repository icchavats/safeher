import express from 'express';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  testContactAlert,
} from '../controllers/contactController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateContact } from '../middleware/validate.js';

const router = express.Router();

router.use(protect); // All contact routes require auth

router.route('/')
  .get(getContacts)
  .post(validateContact, createContact);

router.route('/:id')
  .put(updateContact)
  .delete(deleteContact);

router.post('/:id/test', testContactAlert);

export default router;
