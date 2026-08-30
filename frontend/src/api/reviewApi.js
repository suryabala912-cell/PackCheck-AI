import apiClient from './apiClient';

export const reviewApi = {
  getReviewQueue: async (statusFilter) => {
    const params = statusFilter ? { status: statusFilter } : {};
    const response = await apiClient.get('/api/v1/reviews', { params });
    return response.data;
  },

  submitManualReview: async (scanReference, reviewRequest) => {
    const response = await apiClient.put(`/api/v1/scans/${scanReference}/review`, reviewRequest);
    return response.data;
  },
};
