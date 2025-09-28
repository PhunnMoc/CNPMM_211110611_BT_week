'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Ban, CheckCircle, Mail, Phone, Calendar, User, Shield } from 'lucide-react';

export default function UserDetailPage() {
   const params = useParams();
   const router = useRouter();
   const userId = params.id;

   // Mock user data - in real app, fetch from API
   const [user, setUser] = useState({
      id: parseInt(userId as string),
      username: 'john_doe',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      isAdmin: false,
      isActive: true,
      createdAt: '2024-01-15',
      lastLogin: '2024-01-20',
      totalOrders: 5,
      totalSpent: 2500000,
      avatarUrl: null
   });

   const [showNotificationModal, setShowNotificationModal] = useState(false);
   const [notificationData, setNotificationData] = useState({
      title: '',
      message: ''
   });

   const handleToggleUserStatus = () => {
      setUser({ ...user, isActive: !user.isActive });
   };

   const handleNotifyUser = () => {
      setShowNotificationModal(true);
   };

   const handleSendNotification = () => {
      if (notificationData.title && notificationData.message) {
         alert(`Notification sent to ${user.firstName} ${user.lastName}`);
         setShowNotificationModal(false);
         setNotificationData({ title: '', message: '' });
      }
   };

   const closeModal = () => {
      setShowNotificationModal(false);
      setNotificationData({ title: '', message: '' });
   };

   return (
      <div className="min-h-screen bg-gray-50">
         {/* Header */}
         <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
               <div className="flex items-center py-8">
                  <button
                     onClick={() => router.back()}
                     className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mr-6"
                  >
                     <ArrowLeft className="h-5 w-5" />
                     <span>Back</span>
                  </button>
                  <div>
                     <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
                     <p className="mt-2 text-sm text-gray-600">
                        View and manage user information
                     </p>
                  </div>
               </div>
            </div>
         </div>

         <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* User Profile Card */}
               <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                     <div className="text-center">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                           <span className="text-gray-600 font-semibold text-2xl">
                              {user.firstName[0]}{user.lastName[0]}
                           </span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                           {user.firstName} {user.lastName}
                        </h2>
                        <p className="text-gray-500">@{user.username}</p>

                        <div className="mt-6 space-y-3">
                           <div className="flex items-center justify-center space-x-2">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${user.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                 }`}>
                                 {user.isActive ? 'Active' : 'Banned'}
                              </span>
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${user.isAdmin
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-gray-100 text-gray-800'
                                 }`}>
                                 {user.isAdmin ? 'Admin' : 'User'}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* User Information */}
               <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                     <h3 className="text-lg font-semibold text-gray-900 mb-6">User Information</h3>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <div className="flex items-center space-x-2">
                                 <Mail className="h-4 w-4 text-gray-400" />
                                 <span className="text-gray-900">{user.email}</span>
                              </div>
                           </div>

                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                              <div className="flex items-center space-x-2">
                                 <Phone className="h-4 w-4 text-gray-400" />
                                 <span className="text-gray-900">{user.phone}</span>
                              </div>
                           </div>

                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                              <div className="flex items-center space-x-2">
                                 <Calendar className="h-4 w-4 text-gray-400" />
                                 <span className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                              <div className="flex items-center space-x-2">
                                 <User className="h-4 w-4 text-gray-400" />
                                 <span className="text-gray-900">{new Date(user.lastLogin).toLocaleDateString()}</span>
                              </div>
                           </div>

                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Total Orders</label>
                              <div className="flex items-center space-x-2">
                                 <Shield className="h-4 w-4 text-gray-400" />
                                 <span className="text-gray-900">{user.totalOrders}</span>
                              </div>
                           </div>

                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Total Spent</label>
                              <div className="flex items-center space-x-2">
                                 <span className="text-gray-900">
                                    {new Intl.NumberFormat('vi-VN', {
                                       style: 'currency',
                                       currency: 'VND'
                                    }).format(user.totalSpent)}
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                     <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions</h3>

                     <div className="flex flex-wrap gap-4">
                        <button
                           onClick={handleNotifyUser}
                           className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                           <Bell className="h-4 w-4" />
                           <span>Send Notification</span>
                        </button>

                        <button
                           onClick={handleToggleUserStatus}
                           className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${user.isActive
                                 ? 'bg-red-600 text-white hover:bg-red-700'
                                 : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                        >
                           {user.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                           <span>{user.isActive ? 'Ban User' : 'Unban User'}</span>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Notification Modal */}
         {showNotificationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-lg font-semibold text-gray-900">
                        Send Notification to {user.firstName} {user.lastName}
                     </h3>
                     <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600"
                     >
                        <span className="sr-only">Close</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
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
