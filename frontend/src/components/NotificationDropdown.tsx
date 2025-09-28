'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, AlertCircle, Package, Star, DollarSign, Gift, Info } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGetNotificationsQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation, useDeleteNotificationMutation, useDeleteAllReadNotificationsMutation, api } from '@/store/api/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { showToast } from '@/utils/toast';

const NotificationIcon = ({ type }: { type: string }) => {
   const iconProps = { size: 16, className: "text-gray-500" };

   switch (type) {
      case 'order_update':
         return <Package {...iconProps} />;
      case 'review_notification':
         return <Star {...iconProps} />;
      case 'price_change':
         return <DollarSign {...iconProps} />;
      case 'stock_alert':
         return <AlertCircle {...iconProps} />;
      case 'coupon_expiry':
         return <Gift {...iconProps} />;
      case 'admin_notification':
         return <AlertCircle {...iconProps} />;
      default:
         return <Info {...iconProps} />;
   }
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }: {
   notification: any;
   onMarkAsRead: (id: number) => void;
   onDelete: (id: number) => void;
}) => {
   const [isHovered, setIsHovered] = useState(false);

   const handleMarkAsRead = () => {
      if (!notification.isRead) {
         onMarkAsRead(notification.id);
      }
   };

   const handleDelete = () => {
      onDelete(notification.id);
   };

   return (
      <div
         className={`p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
            }`}
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
      >
         <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
               <NotificationIcon type={notification.type} />
            </div>

            <div className="flex-1 min-w-0">
               <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                     {notification.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                     {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                     )}
                     {isHovered && (
                        <div className="flex space-x-1">
                           {!notification.isRead && (
                              <button
                                 onClick={handleMarkAsRead}
                                 className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                 title="Mark as read"
                              >
                                 <Check size={14} />
                              </button>
                           )}
                           <button
                              onClick={handleDelete}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                           >
                              <Trash2 size={14} />
                           </button>
                        </div>
                     )}
                  </div>
               </div>

               <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
               </p>

               <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                     {new Date(notification.createdAt).toLocaleString()}
                  </span>
                  {notification.data && (
                     <span className="text-xs text-blue-600 capitalize">
                        {notification.type.replace('_', ' ')}
                     </span>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export const NotificationDropdown = () => {
   const [isOpen, setIsOpen] = useState(false);
   const dispatch = useDispatch<AppDispatch>();

   // Get notifications from Redux store for real-time updates
   const { notifications: realtimeNotifications, unreadCount: realtimeUnreadCount } = useSelector((state: RootState) => state.notifications);

   // Also fetch from API for initial load and when dropdown opens
   const { data: notificationsData, isLoading, refetch } = useGetNotificationsQuery({
      page: 1,
      limit: 10,
      unreadOnly: false
   }, {
      // Only fetch when dropdown is open or when we need initial data
      skip: !isOpen && realtimeNotifications.length === 0
   });

   const [markAsRead] = useMarkNotificationAsReadMutation();
   const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
   const [deleteNotification] = useDeleteNotificationMutation();
   const [deleteAllRead] = useDeleteAllReadNotificationsMutation();

   // Use real-time notifications if available, otherwise fall back to API data
   const notifications = realtimeNotifications.length > 0 ? realtimeNotifications : (notificationsData?.notifications || []);

   // Calculate unread count from current notifications
   const unreadCount = notifications.filter(n => !n.isRead).length;

   // Refetch when dropdown opens to ensure we have the latest data
   useEffect(() => {
      if (isOpen) {
         refetch();
      }
   }, [isOpen, refetch]);

   // Invalidate RTK Query cache when new notifications arrive via WebSocket
   useEffect(() => {
      if (realtimeNotifications.length > 0) {
         dispatch(api.util.invalidateTags(['Notification']));
      }
   }, [realtimeNotifications.length, dispatch]);

   const handleMarkAsRead = async (notificationId: number) => {
      try {
         await markAsRead(notificationId).unwrap();
         showToast.success('Notification marked as read');
      } catch (error) {
         showToast.error('Failed to mark notification as read');
      }
   };

   const handleDelete = async (notificationId: number) => {
      try {
         await deleteNotification(notificationId).unwrap();
         showToast.success('Notification deleted');
      } catch (error) {
         showToast.error('Failed to delete notification');
      }
   };

   const handleMarkAllAsRead = async () => {
      try {
         await markAllAsRead().unwrap();
         showToast.success('All notifications marked as read');
      } catch (error) {
         showToast.error('Failed to mark all notifications as read');
      }
   };

   const handleDeleteAllRead = async () => {
      try {
         await deleteAllRead().unwrap();
         showToast.success('All read notifications deleted');
      } catch (error) {
         showToast.error('Failed to delete read notifications');
      }
   };

   return (
      <div className="relative">
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
         >
            <Bell size={20} />
            {unreadCount > 0 && (
               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
               </span>
            )}
         </button>

         {isOpen && (
            <>
               <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsOpen(false)}
               />
               <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                     <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                           Notifications
                        </h3>
                        <button
                           onClick={() => setIsOpen(false)}
                           className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                           <X size={20} />
                        </button>
                     </div>

                     {notifications.length > 0 && (
                        <div className="flex space-x-2 mt-3">
                           <button
                              onClick={handleMarkAllAsRead}
                              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                           >
                              Mark all as read
                           </button>
                           <button
                              onClick={handleDeleteAllRead}
                              className="text-xs text-red-600 hover:text-red-800 transition-colors"
                           >
                              Delete all read
                           </button>
                        </div>
                     )}
                  </div>

                  <div className="overflow-y-auto max-h-80">
                     {isLoading ? (
                        <div className="p-4 text-center text-gray-500">
                           Loading notifications...
                        </div>
                     ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                           No notifications yet
                        </div>
                     ) : (
                        notifications.map((notification) => (
                           <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onMarkAsRead={handleMarkAsRead}
                              onDelete={handleDelete}
                           />
                        ))
                     )}
                  </div>

                  {notifications.length > 0 && (
                     <div className="p-3 border-t border-gray-200 text-center">
                        <button
                           onClick={() => setIsOpen(false)}
                           className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                           View all notifications
                        </button>
                     </div>
                  )}
               </div>
            </>
         )}
      </div>
   );
};
