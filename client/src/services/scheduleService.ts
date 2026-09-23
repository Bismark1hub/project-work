import api from './api';

export const scheduleService = {
  getByDate: async (date: string) => {
    const response = await api.get(`/schedule?date=${date}`);
    return response.data;
  },

  getByWeek: async (start: string, end: string) => {
    const response = await api.get(`/schedule?start=${start}&end=${end}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/schedule', data);
    return response.data;
  },

  updateStatus: async (id: string, data: any) => {
    const response = await api.patch(`/schedule/${id}/status`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/schedule/${id}`);
    return response.data;
  },
};