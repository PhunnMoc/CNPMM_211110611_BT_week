import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: number;
  type: 'order_update' | 'review_notification' | 'price_change' | 'stock_alert' | 'coupon_expiry' | 'admin_notification' | 'general';
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  lastFetched: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
      state.lastFetched = Date.now();
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Check if notification already exists
      const existingIndex = state.notifications.findIndex(n => n.id === action.payload.id);
      if (existingIndex === -1) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
      }
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        if (!notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        }
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    removeAllRead: (state) => {
      const readCount = state.notifications.filter(n => n.isRead).length;
      state.notifications = state.notifications.filter(n => !n.isRead);
      state.unreadCount = state.notifications.length;
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
      state.lastFetched = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  removeAllRead,
  updateUnreadCount,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
