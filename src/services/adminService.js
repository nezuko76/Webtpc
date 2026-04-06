import api from './api';

export const adminService = {
  getDashboard: () => api.get('/api/admin/dashboard'),

  getProducts: (params) => api.get('/api/admin/products', { params }),
  createProduct: (formData) => api.post('/api/admin/products', formData),
  updateProduct: (id, formData) => api.put(`/api/admin/products/${id}`, formData),
  createProductJson: (data) => api.post('/api/admin/products/json', data),
  updateProductJson: (id, data) => api.put(`/api/admin/products/${id}/json`, data),
  uploadProductImages: (id, formData) => api.post(`/api/admin/products/${id}/images`, formData),
  deleteProduct: (id) => api.delete(`/api/admin/products/${id}`),
  getLowStock: () => api.get('/api/admin/products/low-stock'),

  getCategories: () => api.get('/api/admin/categories'),
  createCategory: (formData) => api.post('/api/admin/categories', formData),
  updateCategory: (id, formData) => api.put(`/api/admin/categories/${id}`, formData),
  deleteCategory: (id) => api.delete(`/api/admin/categories/${id}`),

  getOrders: (params) => api.get('/api/admin/orders', { params }),
  updateOrderStatus: (id, status) =>
    api.put(`/api/admin/orders/${id}/status`, null, { params: { status } }),

  getUsers: (params) => api.get('/api/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/api/admin/users/${id}/status`),
  changeRole: (id, role) =>
    api.put(`/api/admin/users/${id}/role`, null, { params: { role } }),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),

  getCoupons: () => api.get('/api/admin/coupons'),
  createCoupon: (data) => api.post('/api/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/api/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/api/admin/coupons/${id}`),

  getBanners: () => api.get('/api/admin/banners'),
  createBanner: (formData) => api.post('/api/admin/banners', formData),
  toggleBanner: (id) => api.put(`/api/admin/banners/${id}/status`),
  deleteBanner: (id) => api.delete(`/api/admin/banners/${id}`),

  getReviews: (params) => api.get('/api/admin/reviews', { params }),
  toggleReview: (id) => api.put(`/api/admin/reviews/${id}/visibility`),
  deleteReview: (id) => api.delete(`/api/admin/reviews/${id}`),
};