import { create } from 'zustand';
import api from '../api/client';

const useResourceStore = create((set) => ({
  resources: [],
  loading: false,
  error: null,

  fetchResources: async (category) => {
    set({ loading: true, error: null });
    try {
      const params = category && category !== 'All' ? { category } : {};
      const { data } = await api.get('/resources', { params });
      set({ resources: data.data ?? [], loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch resources', loading: false });
    }
  },

  createResource: async (resourceData) => {
    const { data } = await api.post('/resources', resourceData);
    set((s) => ({ resources: [data.data, ...s.resources] }));
    return data.data;
  },

  updateResource: async (id, updates) => {
    const { data } = await api.put(`/resources/${id}`, updates);
    set((s) => ({ resources: s.resources.map((r) => (r._id === id ? data.data : r)) }));
    return data.data;
  },

  deleteResource: async (id) => {
    await api.delete(`/resources/${id}`);
    set((s) => ({ resources: s.resources.filter((r) => r._id !== id) }));
  },
}));

export default useResourceStore;
