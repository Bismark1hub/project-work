import api from './api';

export const analyticsService = {
  getSummary: async () => {
    const response = await api.get('/analytics/summary');
    return response.data;
  },
  getConsistency: async (range: string = '7d') => {
    const response = await api.get(`/analytics/consistency?range=${range}`);
    return response.data;
  },
  getSubjects: async () => {
    const response = await api.get('/analytics/subjects');
    return response.data;
  },
  getHeatmap: async () => {
    const response = await api.get('/analytics/heatmap');
    return response.data;
  },
  getFocusTrend: async () => {
    const response = await api.get('/analytics/focus-trend');
    return response.data;
  },
};