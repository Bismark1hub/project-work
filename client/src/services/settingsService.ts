import api from './api';

export const settingsService = {
  getProfile: async () => {
    const response = await api.get('/settings/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.patch('/settings/profile', data);
    return response.data;
  },

  changePassword: async (current_password: string, new_password: string) => {
    const response = await api.post('/settings/change-password', { current_password, new_password });
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (data: any) => {
    const response = await api.patch('/settings', data);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/settings/account');
    return response.data;
  },
};