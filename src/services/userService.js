import api from './api';

export const userService = {
  getProfile: async () => {
    const res = await api.get('/api/users/me');
    return res.data.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/api/users/me', data);
    return res.data.data;
  },
  updateAvatar: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post('/api/users/me/avatar', form);
    return res.data.data;
  },
  getAddresses: async () => {
    const res = await api.get('/api/users/me/addresses');
    return res.data.data;
  },
  addAddress: async (data) => {
    const res = await api.post('/api/users/me/addresses', data);
    return res.data.data;
  },
  updateAddress: async (id, data) => {
    const res = await api.put(`/api/users/me/addresses/${id}`, data);
    return res.data.data;
  },
  deleteAddress: async (id) => {
    const res = await api.delete(`/api/users/me/addresses/${id}`);
    return res.data.data;
  },
};

export default userService;
