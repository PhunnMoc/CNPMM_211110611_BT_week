'use client';

import React, { useState } from 'react';
import { Bell, Check, Trash2, AlertCircle, Package, Star, DollarSign, Gift, Info, Filter } from 'lucide-react';
import { useGetNotificationsQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation, useDeleteNotificationMutation, useDeleteAllReadNotificationsMutation } from '@/store/api/api';
import { showToast } from '@/utils/toast';

const NotificationIcon = ({ type }: { type: string }) => {
   const iconProps = { size: 20, className: "text-gray-500" };

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
         className={`p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all ${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'
            }`}
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
      >
         <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
               <NotificationIcon type={notification.type} />
            </div>

            <div className="flex-1 min-w-0">
               <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                     {notification.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                     {!notification.isRead && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                     )}
                     {isHovered && (
                        <div className="flex space-x-2">
                           {!notification.isRead && (
                              <button
                                 onClick={handleMarkAsRead}
                                 className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                 title="Mark as read"
                              >
                                 <Check size={16} />
                              </button>
                           )}
                           <button
                              onClick={handleDelete}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                     )}
                  </div>
               </div>

               <p className="text-gray-600 mt-2 leading-relaxed">
                  {notification.message}
               </p>

               <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-500">
                     {new Date(notification.createdAt).toLocaleString()}
                  </span>
                  <div className="flex items-center space-x-2">
                     <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full capitalize">
                        {notification.type.replace('_', ' ')}
                     </span>
                     {notification.data && (
                        <span className="text-xs text-gray-500">
                           {Object.keys(notification.data).length} details
                        </span>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default function NotificationsPage() {
   const [page, setPage] = useState(1);
   const [unreadOnly, setUnreadOnly] = useState(false);
   const limit = 20;

   const { data: notificationsData, isLoading, error } = useGetNotificationsQuery({
      page,
      limit,
      unreadOnly
   });

   const [markAsRead] = useMarkNotificationAsReadMutation();
   const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
   const [deleteNotification] = useDeleteNotificationMutation();
   const [deleteAllRead] = useDeleteAllReadNotificationsMutation();

   const notifications = notificationsData?.notifications || [];
   const pagination = notificationsData?.pagination;

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

   const handleFilterChange = (unread: boolean) => {
      setUnreadOnly(unread);
      setPage(1); // Reset to first page when filtering
   };

   const handlePageChange = (newPage: number) => {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   if (error) {
      return (
         <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
               <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Notifications</h2>
                  <p className="text-red-600">Failed to load notifications. Please try again later.</p>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50 py-8">
         <div className="max-w-4xl mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                     <Bell className="h-8 w-8 text-blue-600" />
                     <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                  </div>

                  {notifications.length > 0 && (
                     <div className="flex space-x-3">
                        <button
                           onClick={handleMarkAllAsRead}
                           className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                           Mark all as read
                        </button>
                        <button
                           onClick={handleDeleteAllRead}
                           className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                           Delete all read
                        </button>
                     </div>
                  )}
               </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
               <div className="flex items-center space-x-4">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <div className="flex space-x-2">
                     <button
                        onClick={() => handleFilterChange(false)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${!unreadOnly
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                           }`}
                     >
                        All Notifications
                     </button>
                     <button
                        onClick={() => handleFilterChange(true)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${unreadOnly
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                           }`}
                     >
                        Unread Only
                     </button>
                  </div>
               </div>
            </div>

            {/* Notifications List */}
            {isLoading ? (
               <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                     <div key={i} className="p-4 border border-gray-200 rounded-lg bg-white animate-pulse">
                        <div className="flex items-start space-x-4">
                           <div className="w-5 h-5 bg-gray-300 rounded"></div>
                           <div className="flex-1">
                              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            ) : notifications.length === 0 ? (
               <div className="text-center py-12">
                  <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">
                     {unreadOnly ? 'No unread notifications' : 'No notifications yet'}
                  </h3>
                  <p className="text-gray-400">
                     {unreadOnly
                        ? 'You\'re all caught up! Check back later for new notifications.'
                        : 'You\'ll see notifications about your orders, reviews, and more here.'
                     }
                  </p>
               </div>
            ) : (
               <div className="space-y-4">
                  {notifications.map((notification) => (
                     <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                     />
                  ))}
               </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
               <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                     <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                     >
                        Previous
                     </button>

                     {[...Array(pagination.totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        const isCurrentPage = pageNum === page;
                        const isNearCurrent = Math.abs(pageNum - page) <= 2;
                        const isFirstOrLast = pageNum === 1 || pageNum === pagination.totalPages;

                        if (!isNearCurrent && !isFirstOrLast) {
                           if (pageNum === 2 || pageNum === pagination.totalPages - 1) {
                              return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                           }
                           return null;
                        }

                        return (
                           <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 text-sm rounded-lg transition-colors ${isCurrentPage
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                 }`}
                           >
                              {pageNum}
                           </button>
                        );
                     })}

                     <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === pagination.totalPages}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                     >
                        Next
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
