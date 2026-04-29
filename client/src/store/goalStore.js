import { create } from 'zustand';
import api from '../api/client';

const useGoalStore = create((set, get) => ({
  goals: [],
  loading: false,
  error: null,

  fetchGoals: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/goals');
      set({ goals: data.data ?? [], loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch goals', loading: false });
    }
  },

  createGoal: async (goalData) => {
    const { data } = await api.post('/goals', goalData);
    set((s) => ({ goals: [data.data, ...s.goals] }));
    return data.data;
  },

  updateGoal: async (id, updates) => {
    const { data } = await api.put(`/goals/${id}`, updates);
    set((s) => ({ goals: s.goals.map((g) => (g._id === id ? data.data : g)) }));
    return data.data;
  },

  deleteGoal: async (id) => {
    await api.delete(`/goals/${id}`);
    set((s) => ({ goals: s.goals.filter((g) => g._id !== id) }));
  },
}));

export default useGoalStore;
