import api from './api';

export const orderService = {
  checkout: async (data) => {
    const res = await api.post('/api/orders/checkout', data);
    return res.data.data;
  },
  getMyOrders: async (params) => {
    const res = await api.get('/api/orders', { params });
    return res.data.data;
  },
  getOrderDetail: async (id) => {
    const res = await api.get(`/api/orders/${id}`);
    return res.data.data;
  },
  cancelOrder: async (id) => {
    const res = await api.put(`/api/orders/${id}/cancel`);
    return res.data.data;
  },
};

export default orderService;
