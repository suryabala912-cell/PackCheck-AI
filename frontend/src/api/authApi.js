import apiClient from './apiClient';

export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post('/api/v1/auth/login', { email, password });
    return response.data;
  },
  getHealth: async () => {
    const response = await apiClient.get('/api/v1/health');
    return response.data;
  }
};
