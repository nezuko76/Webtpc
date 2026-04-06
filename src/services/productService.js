import api from './api';

export const productService = {
  getProducts: async (params) => {
    const res = await api.get('/api/products', { params });
    return res.data.data;
  },
  getById: async (id) => {
    const res = await api.get(`/api/products/${id}`);
    return res.data.data;
  },
  getFeatured: async () => {
    const res = await api.get('/api/products/featured');
    return res.data.data;
  },
  getRelated: async (id, categoryId) => {
    const res = await api.get(`/api/products/${id}/related`, { params: { categoryId } });
    return res.data.data;
  },
  getCategories: async () => {
    const res = await api.get('/api/categories');
    return res.data.data;
  },
  getBanners: async () => {
    const res = await api.get('/api/banners');
    return res.data.data;
  },
};

export default productService;
