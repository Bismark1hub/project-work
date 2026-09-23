import api from './api';

export const insightService = {
  getAll: async () => {
    const response = await api.get('/insights');
    return response.data;
  },

  getPending: async () => {
    const response = await api.get('/insights/pending');
    return response.data;
  },

  analyze: async () => {
    const response = await api.post('/insights/analyze');
    return response.data;
  },

  accept: async (id: string) => {
    const response = await api.patch(`/insights/${id}/accept`);
    return response.data;
  },

  dismiss: async (id: string) => {
    const response = await api.patch(`/insights/${id}/dismiss`);
    return response.data;
  },
};