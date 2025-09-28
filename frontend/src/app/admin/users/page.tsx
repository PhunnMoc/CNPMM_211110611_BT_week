'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, Bell, Ban, CheckCircle, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGetAdminUsersQuery, useUpdateUserStatusMutation, useSendBroadcastNotificationMutation } from '@/store/api/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AdminUsers() {
   const { user: currentUser } = useAuth();
   const router = useRouter();
   const [searchTerm, setSearchTerm] = useState('');
   const [showNotificationModal, setShowNotificationModal] = useState(false);
   const [selectedUser, setSelectedUser] = useState<any>(null);
   const [notificationData, setNotificationData] = useState({
      title: '',
      message: ''
   });

   // Fetch users from API
   const { data: usersData, isLoading, error } = useGetAdminUsersQuery({
      search: searchTerm,
      limit: 50
   });

   const [updateUserStatus] = useUpdateUserStatusMutation();
   const [sendNotification] = useSendBroadcastNotificationMutation();

   const users = usersData?.users || [];

   const filteredUsers = users.filter(user => {
      // Exclude all admin users from the list
      if (user.is_admin) {
         return false;
      }
      return true;
   });

   const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
      try {
         await updateUserStatus({
            id: userId,
            is_active: !currentStatus
         }).unwrap();
      } catch (error) {
         console.error('Failed to update user status:', error);
         alert('Failed to update user status');
      }
   };

   const handleNotifyUser = (user: any) => {
      setSelectedUser(user);
      setShowNotificationModal(true);
   };

   const handleSendNotification = async () => {
      if (notificationData.title && notificationData.message) {
         try {
            await sendNotification({
               title: notificationData.title,
               message: notificationData.message,
               type: 'admin_notification',
               data: { userId: selectedUser.id }
            }).unwrap();

            alert(`Notification sent to ${selectedUser.first_name} ${selectedUser.last_name}`);
            setShowNotificationModal(false);
            setNotificationData({ title: '', message: '' });
            setSelectedUser(null);
         } catch (error) {
            console.error('Failed to send notification:', error);
            alert('Failed to send notification');
         }
      }
   };

   const closeModal = () => {
      setShowNotificationModal(false);
      setNotificationData({ title: '', message: '' });
      setSelectedUser(null);
   };

   if (isLoading) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <LoadingSpinner />
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
               <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading users</h2>
               <p className="text-gray-600">Please try again later</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50">
         {/* Header */}
         <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
               <div className="flex justify-between items-center py-8">
                  <div>
                     <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                     <p className="mt-2 text-sm text-gray-600">
                        Manage user accounts and send notifications
                     </p>
                  </div>
               </div>
            </div>
         </div>

         <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
            {/* Search */}
            <div className="mb-8">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                     type="text"
                     placeholder="Search users..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
               </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                     <tr>
                        <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           User
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Contact
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Status
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Role
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Created
                        </th>
                        <th className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Actions
                        </th>
                     </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                           <td className="px-8 py-6 whitespace-nowrap">
                              <div
                                 className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                 onClick={() => router.push(`/admin/users/${user.id}`)}
                              >
                                 <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600 font-semibold text-lg">
                                       {user.first_name?.[0] || user.username?.[0]}{user.last_name?.[0] || user.username?.[1]}
                                    </span>
                                 </div>
                                 <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                       {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                                    </div>
                                    <div className="text-sm text-gray-500">@{user.username}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.email}</div>
                              <div className="text-sm text-gray-500">{user.phone}</div>
                           </td>
                           <td className="px-8 py-6 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${user.isActive
                                 ? 'bg-green-100 text-green-800'
                                 : 'bg-red-100 text-red-800'
                                 }`}>
                                 {user.isActive ? 'Active' : 'Banned'}
                              </span>
                           </td>
                           <td className="px-8 py-6 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${user.isAdmin
                                 ? 'bg-purple-100 text-purple-800'
                                 : 'bg-gray-100 text-gray-800'
                                 }`}>
                                 {user.isAdmin ? 'Admin' : 'User'}
                              </span>
                           </td>
                           <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                           </td>
                           <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-3">
                                 <button
                                    onClick={() => handleNotifyUser(user)}
                                    className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Send Notification"
                                 >
                                    <Bell className="h-4 w-4" />
                                    <span className="text-sm">Notify</span>
                                 </button>
                                 <button
                                    onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${user.is_active
                                       ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                       : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                       }`}
                                    title={user.is_active ? 'Ban User' : 'Unban User'}
                                 >
                                    {user.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                    <span className="text-sm">{user.is_active ? 'Ban' : 'Unban'}</span>
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Notification Modal */}
         {showNotificationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-lg font-semibold text-gray-900">
                        Send Notification to {selectedUser?.first_name} {selectedUser?.last_name}
                     </h3>
                     <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600"
                     >
                        <X className="h-5 w-5" />
                     </button>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Title
                        </label>
                        <input
                           type="text"
                           value={notificationData.title}
                           onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                           placeholder="Enter notification title..."
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Message
                        </label>
                        <textarea
                           value={notificationData.message}
                           onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                           rows={4}
                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                           placeholder="Enter notification message..."
                        />
                     </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                     <button
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleSendNotification}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                     >
                        Send Notification
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}