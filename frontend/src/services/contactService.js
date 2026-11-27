import api from './api';

export const contactService = {
  // Get all contacts
  async getContacts() {
    const response = await api.get('/contacts');
    return response.data;
  },

  // Create new contact
  async createContact(contactData) {
    const response = await api.post('/contacts', contactData);
    return response.data;
  },

  // Update existing contact
  async updateContact(id, contactData) {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data;
  },

  // Delete contact
  async deleteContact(id) {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },

  // Send test alert to contact
  async testContact(id) {
    const response = await api.post(`/contacts/${id}/test`);
    return response.data;
  },
};
