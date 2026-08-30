import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('agentflow_token');
      const userStr = localStorage.getItem('agentflow_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ token, user, isAuthenticated: true, isLoading: false });
          return;
        } catch (e) {
          localStorage.removeItem('agentflow_token');
          localStorage.removeItem('agentflow_user');
        }
      }
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('agentflow_token', token);
        localStorage.setItem('agentflow_user', JSON.stringify(user));
      }

      set({ token, user, isAuthenticated: true, isLoading: false, error: null });
      return { success: true, user };
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Login failed';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  register: async (name, email, password, role = 'operator') => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { token, user } = res.data.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('agentflow_token', token);
        localStorage.setItem('agentflow_user', JSON.stringify(user));
      }

      set({ token, user, isAuthenticated: true, isLoading: false, error: null });
      return { success: true, user };
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Registration failed';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/auth/me');
      const user = res.data.data.user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('agentflow_user', JSON.stringify(user));
      }
      set({ user });
      return user;
    } catch (err) {
      console.warn('Failed to refresh user profile:', err.message);
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
    }
    set({ token: null, user: null, isAuthenticated: false, error: null });
  },
}));
