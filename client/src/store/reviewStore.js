import { create } from 'zustand';
import api from '../api/client';

const useReviewStore = create((set, get) => ({
  reviews: [],
  loading: false,
  error: null,
  autofill: null,

  fetchReviews: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/reviews');
      set({ reviews: data.data ?? [], loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch reviews', loading: false });
    }
  },

  createReview: async (reviewData) => {
    const tempId = `temp_${Date.now()}`;
    const tempReview = { ...reviewData, _id: tempId, _optimistic: true };
    set((state) => ({ reviews: [tempReview, ...state.reviews], error: null }));
    try {
      const { data } = await api.post('/reviews', reviewData);
      set((state) => ({
        reviews: state.reviews.map((r) => (r._id === tempId ? data.data : r)),
      }));
      return data;
    } catch (err) {
      set((state) => ({
        reviews: state.reviews.filter((r) => r._id !== tempId),
        error: err.response?.data?.message || 'Failed to create review',
      }));
      throw err;
    }
  },

  updateReview: async (id, reviewData) => {
    const prev = get().reviews;
    set((state) => ({
      reviews: state.reviews.map((r) => (r._id === id ? { ...r, ...reviewData } : r)),
      error: null,
    }));
    try {
      const { data } = await api.put(`/reviews/${id}`, reviewData);
      set((state) => ({
        reviews: state.reviews.map((r) => (r._id === id ? data.data : r)),
      }));
      return data;
    } catch (err) {
      set({ reviews: prev, error: err.response?.data?.message || 'Failed to update review' });
      throw err;
    }
  },

  fetchAutofill: async () => {
    try {
      const { data } = await api.get('/reviews/autofill');
      set({ autofill: data.data });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch autofill data' });
    }
  },
}));

export default useReviewStore;
