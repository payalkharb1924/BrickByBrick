import { create } from 'zustand';
import api from '../api/client';

const useJobStore = create((set, get) => ({
  applications: [],
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null,
  followUps: [],

  fetchApplications: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/jobs', { params: filters });
      set({
        applications: data.data ?? [],
        total: data.total,
        page: data.page,
        pages: data.pages,
        loading: false,
      });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch applications', loading: false });
    }
  },

  createApplication: async (appData) => {
    const tempId = `temp_${Date.now()}`;
    const tempApp = { ...appData, _id: tempId, _optimistic: true };
    set((state) => ({ applications: [tempApp, ...state.applications], error: null }));
    try {
      const { data } = await api.post('/jobs', appData);
      set((state) => ({
        applications: state.applications.map((a) => (a._id === tempId ? data.data : a)),
      }));
      return data;
    } catch (err) {
      set((state) => ({
        applications: state.applications.filter((a) => a._id !== tempId),
        error: err.response?.data?.message || 'Failed to create application',
      }));
      throw err;
    }
  },

  updateApplication: async (id, appData) => {
    const prev = get().applications;
    set((state) => ({
      applications: state.applications.map((a) => (a._id === id ? { ...a, ...appData } : a)),
      error: null,
    }));
    try {
      const { data } = await api.put(`/jobs/${id}`, appData);
      set((state) => ({
        applications: state.applications.map((a) => (a._id === id ? data.data : a)),
      }));
      return data;
    } catch (err) {
      set({ applications: prev, error: err.response?.data?.message || 'Failed to update application' });
      throw err;
    }
  },

  deleteApplication: async (id) => {
    const prev = get().applications;
    set((state) => ({ applications: state.applications.filter((a) => a._id !== id), error: null }));
    try {
      await api.delete(`/jobs/${id}`);
    } catch (err) {
      set({ applications: prev, error: err.response?.data?.message || 'Failed to delete application' });
      throw err;
    }
  },

  fetchFollowUps: async () => {
    try {
      const { data } = await api.get('/jobs/followups/today');
      set({ followUps: data.data ?? [] });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch follow-ups' });
    }
  },
}));

export default useJobStore;
