import { create } from 'zustand';
import axiosClient from '../api/axiosClient';

export const useCartStore = create((set) => ({
  cart: null,
  isDrawerOpen: false,
  isLoading: false,

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const res = await axiosClient.get('/cart');
      set({ cart: res.data.data });
    } catch {
      set({ cart: null });
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (payload) => {
    set({ isLoading: true });
    try {
      const res = await axiosClient.post('/cart/items', payload);
      set({ cart: res.data.data, isDrawerOpen: true });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (variantId, quantity = 1, messageOnCake = '') => {
    set({ isLoading: true });
    try {
      const res = await axiosClient.post('/cart/items', {
        variantId,
        quantity,
        messageOnCake: messageOnCake || null,
      });
      set({ cart: res.data.data, isDrawerOpen: true });
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId, payload) => {
    set({ isLoading: true });
    try {
      const res = await axiosClient.put(`/cart/items/${itemId}`, payload);
      set({ cart: res.data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true });
    try {
      const res = await axiosClient.delete(`/cart/items/${itemId}`);
      set({ cart: res.data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  clearLocalCart: () => set({ cart: null }),
}));