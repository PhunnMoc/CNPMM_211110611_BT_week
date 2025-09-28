import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { webSocketService } from '../store/slices/webSocketSlice';
import { addNotification, markAsRead, markAllAsRead } from '../store/slices/notificationsSlice';
import { showToast } from '../utils/toast';

export const useWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { isConnected, connectionError } = useSelector((state: RootState) => state.webSocket);
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);
  const initialized = useRef(false);

  // Initialize WebSocket service
  useEffect(() => {
    if (!initialized.current) {
      webSocketService.initialize(dispatch);
      initialized.current = true;
    }
  }, [dispatch]);

  // Connect/disconnect based on authentication
  useEffect(() => {
    if (token && user) {
      webSocketService.connect(token);
    } else {
      webSocketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, [token, user]);

  // Handle connection errors
  useEffect(() => {
    if (connectionError) {
      showToast.error(`WebSocket connection error: ${connectionError}`);
    }
  }, [connectionError]);

  // Handle new notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      if (!latestNotification.isRead) {
        // Show toast for new notifications
        showToast.info(`${latestNotification.title}: ${latestNotification.message}`);
      }
    }
  }, [notifications]);

  const joinProductRoom = (productId: number) => {
    webSocketService.joinProductRoom(productId);
  };

  const leaveProductRoom = (productId: number) => {
    webSocketService.leaveProductRoom(productId);
  };

  const markNotificationAsRead = (notificationId: number) => {
    dispatch(markAsRead(notificationId));
  };

  const markAllNotificationsAsRead = () => {
    dispatch(markAllAsRead());
  };

  return {
    isConnected,
    connectionError,
    unreadCount,
    notifications,
    joinProductRoom,
    leaveProductRoom,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
};
