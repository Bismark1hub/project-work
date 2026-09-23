import api from './api';

export const courseService = {
  getAll: async () => {
    const response = await api.get('/courses');
    return response.data;
  },

  create: async (data: { code: string; name: string; difficulty: string; color?: string }) => {
    const response = await api.post('/courses', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/courses/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};