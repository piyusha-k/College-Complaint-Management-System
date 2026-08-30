import { create } from 'zustand';
import api from '../services/api';
import { getSocket } from '../services/socket';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isDrawerOpen: false,
  isLoading: false,

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/notifications?limit=25');
      const { notifications, unreadCount } = res.data.data;
      set({ notifications, unreadCount, isLoading: false });
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
      set({ isLoading: false });
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: async (id = 'all') => {
    try {
      await api.patch(`/notifications/${id}/read`);
      if (id === 'all') {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      } else {
        set((state) => ({
          notifications: state.notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      }
    } catch (err) {
      console.warn('Failed to mark notification as read:', err.message);
    }
  },
}));
