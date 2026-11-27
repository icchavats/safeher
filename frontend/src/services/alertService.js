import api from './api';

export const alertService = {
  // Trigger emergency SOS alert
  async triggerAlert(payload) {
    const response = await api.post('/alerts/trigger', payload);
    return response.data;
  },

  // Cancel active alert with PIN or safety phrase
  async cancelAlert(alertId, pinOrPhrase) {
    const response = await api.post(`/alerts/${alertId}/cancel`, pinOrPhrase);
    return response.data;
  },

  // Get active alert if any
  async getActiveAlert() {
    const response = await api.get('/alerts/active');
    return response.data;
  },

  // Get alert history
  async getAlertHistory(params = {}) {
    const response = await api.get('/alerts', { params });
    return response.data;
  },

  // Get single alert
  async getAlertById(alertId) {
    const response = await api.get(`/alerts/${alertId}`);
    return response.data;
  },

  // Mark alert as resolved
  async resolveAlert(alertId, note) {
    const response = await api.patch(`/alerts/${alertId}/resolve`, { note });
    return response.data;
  },

  // Upload recorded ambient audio evidence
  async uploadEvidence(formData) {
    const response = await api.post('/evidence/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get analytics summary
  async getAnalytics() {
    const response = await api.get('/analytics/summary');
    return response.data;
  },
};
