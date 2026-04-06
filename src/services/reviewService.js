import api from './api';

export const reviewService = {
  getReviews: async (productId, params) => {
    const res = await api.get(`/api/products/${productId}/reviews`, { params });
    return res.data.data;
  },
  createReview: async (productId, data) => {
    const res = await api.post(`/api/products/${productId}/reviews`, data);
    return res.data.data;
  },
};

export default reviewService;
