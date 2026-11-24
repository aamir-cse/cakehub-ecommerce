import { create } from 'zustand';

const storedToken = localStorage.getItem('cakehub_token');
const storedUser = localStorage.getItem('cakehub_user');

export const useAuthStore = create((set) => ({
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedToken,

  login: (token, user) => {
    localStorage.setItem('cakehub_token', token);
    localStorage.setItem('cakehub_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('cakehub_token');
    localStorage.removeItem('cakehub_user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));