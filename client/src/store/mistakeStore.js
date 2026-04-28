import { create } from 'zustand';
import api from '../api/client';

const useMistakeStore = create((set, get) => ({
  mistakes: [],
  loading: false,
  error: null,

  fetchMistakes: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/mistakes', { params: filters });
      set({ mistakes: data.data ?? [], loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch mistakes', loading: false });
    }
  },

  createMistake: async (mistakeData) => {
    const tempId = `temp_${Date.now()}`;
    const tempMistake = { ...mistakeData, _id: tempId, _optimistic: true };
    set((state) => ({ mistakes: [tempMistake, ...state.mistakes], error: null }));
    try {
      const { data } = await api.post('/mistakes', mistakeData);
      set((state) => ({
        mistakes: state.mistakes.map((m) => (m._id === tempId ? data.data : m)),
      }));
      return data.data;
    } catch (err) {
      set((state) => ({
        mistakes: state.mistakes.filter((m) => m._id !== tempId),
        error: err.response?.data?.message || 'Failed to create mistake',
      }));
      throw err;
    }
  },

  updateMistake: async (id, mistakeData) => {
    const prev = get().mistakes;
    set((state) => ({
      mistakes: state.mistakes.map((m) => (m._id === id ? { ...m, ...mistakeData } : m)),
      error: null,
    }));
    try {
      const { data } = await api.put(`/mistakes/${id}`, mistakeData);
      set((state) => ({
        mistakes: state.mistakes.map((m) => (m._id === id ? data.data : m)),
      }));
      return data.data;
    } catch (err) {
      set({ mistakes: prev, error: err.response?.data?.message || 'Failed to update mistake' });
      throw err;
    }
  },

  deleteMistake: async (id) => {
    const prev = get().mistakes;
    set((state) => ({ mistakes: state.mistakes.filter((m) => m._id !== id), error: null }));
    try {
      await api.delete(`/mistakes/${id}`);
    } catch (err) {
      set({ mistakes: prev, error: err.response?.data?.message || 'Failed to delete mistake' });
      throw err;
    }
  },
}));

export default useMistakeStore;
