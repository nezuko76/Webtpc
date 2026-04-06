import api from './api';

export const cartService = {
  getCart: async () => {
    const res = await api.get('/api/cart');
    return res.data.data;
  },
  addItem: async (data) => {
    const res = await api.post('/api/cart', data);
    return res.data.data;
  },
  updateItem: async (id, quantity) => {
    const res = await api.put(`/api/cart/${id}`, null, { params: { quantity } });
    return res.data.data;
  },
  removeItem: async (id) => {
    const res = await api.delete(`/api/cart/${id}`);
    return res.data.data;
  },
};

export default cartService;
