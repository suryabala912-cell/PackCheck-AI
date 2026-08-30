import apiClient from './apiClient';

export const scanApi = {
  analyzeScan: async (file, productName, category, isImported, officerId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (productName) formData.append('product_name', productName);
    if (category) formData.append('category', category);
    formData.append('is_imported', isImported ? 'true' : 'false');
    if (officerId) formData.append('officer_id', officerId);

    const response = await apiClient.post('/api/v1/scans/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getScanHistory: async () => {
    const response = await apiClient.get('/api/v1/scans');
    return response.data;
  },

  getScanDetails: async (scanReference) => {
    const response = await apiClient.get(`/api/v1/scans/${scanReference}`);
    return response.data;
  },
};
