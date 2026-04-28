import { create } from 'zustand';
import api from '../api/client';

const useDsaStore = create((set, get) => ({
  entries: [],
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null,
  revisions: [],

  fetchEntries: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/dsa', { params: filters });
      set({
        entries: data.data || [],
        total: data.total,
        page: data.page,
        pages: data.pages,
        loading: false,
      });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch entries', loading: false });
    }
  },

  createEntry: async (entryData) => {
    const tempId = `temp_${Date.now()}`;
    const tempEntry = { ...entryData, _id: tempId, _optimistic: true };
    set((state) => ({ entries: [tempEntry, ...state.entries], error: null }));
    try {
      const { data } = await api.post('/dsa', entryData);
      set((state) => ({
        entries: state.entries.map((e) => (e._id === tempId ? data.data : e)),
      }));
      return data.data;
    } catch (err) {
      set((state) => ({
        entries: state.entries.filter((e) => e._id !== tempId),
        error: err.response?.data?.message || 'Failed to create entry',
      }));
      throw err;
    }
  },

  updateEntry: async (id, entryData) => {
    const prev = get().entries;
    set((state) => ({
      entries: state.entries.map((e) => (e._id === id ? { ...e, ...entryData } : e)),
      error: null,
    }));
    try {
      const { data } = await api.put(`/dsa/${id}`, entryData);
      set((state) => ({
        entries: state.entries.map((e) => (e._id === id ? data.data : e)),
      }));
      return data.data;
    } catch (err) {
      set({ entries: prev, error: err.response?.data?.message || 'Failed to update entry' });
      throw err;
    }
  },

  deleteEntry: async (id) => {
    const prev = get().entries;
    set((state) => ({ entries: state.entries.filter((e) => e._id !== id) }));
    try {
      await api.delete(`/dsa/${id}`);
    } catch (err) {
      set({ entries: prev, error: err.response?.data?.message || 'Failed to delete entry' });
      throw err;
    }
  },

  fetchRevisions: async () => {
    try {
      const { data } = await api.get('/dsa/revisions/today');
      set({ revisions: data.data || [] });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch revisions' });
    }
  },
}));

export default useDsaStore;
