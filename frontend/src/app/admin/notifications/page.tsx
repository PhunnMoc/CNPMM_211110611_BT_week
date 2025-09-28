'use client';

import React, { useState } from 'react';
import { Bell, Send, Users, MessageSquare, AlertCircle, Package } from 'lucide-react';
import { useSendBroadcastNotificationMutation } from '@/store/api/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function AdminNotificationsPage() {
   const [formData, setFormData] = useState({
      title: '',
      message: '',
      type: 'general',
      data: ''
   });

   const [sendNotification, { isLoading }] = useSendBroadcastNotificationMutation();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
         const notificationData = {
            title: formData.title,
            message: formData.message,
            type: formData.type,
            data: formData.data ? JSON.parse(formData.data) : null
         };

         await sendNotification(notificationData).unwrap();

         // Reset form
         setFormData({
            title: '',
            message: '',
            type: 'general',
            data: ''
         });

         alert('Notification sent successfully!');
      } catch (error) {
         console.error('Failed to send notification:', error);
         alert('Failed to send notification. Please try again.');
      }
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const notificationTypes = [
      { value: 'general', label: 'General Announcement' },
      { value: 'order_update', label: 'Order Update' },
      { value: 'review_notification', label: 'Review Notification' },
      { value: 'price_change', label: 'Price Change' },
      { value: 'stock_alert', label: 'Stock Alert' },
      { value: 'coupon_expiry', label: 'Coupon Expiry' },
      { value: 'admin_notification', label: 'Admin Notification' }
   ];

   if (isLoading) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <LoadingSpinner />
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50">
         {/* Header */}
         <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex justify-between items-center py-6">
                  <div>
                     <h1 className="text-3xl font-bold text-gray-900">Send Notification</h1>
                     <p className="mt-1 text-sm text-gray-500">
                        Send broadcast notifications to all users
                     </p>
                  </div>
                  <Link
                     href="/admin"
                     className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                     Back to Dashboard
                  </Link>
               </div>
            </div>
         </div>

         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Notification Form */}
            <div className="bg-white rounded-lg shadow p-6">
               <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                     <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Title
                     </label>
                     <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        maxLength={200}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="Enter notification title..."
                     />
                  </div>

                  {/* Message */}
                  <div>
                     <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Message
                     </label>
                     <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        maxLength={1000}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="Enter notification message..."
                     />
                  </div>

                  {/* Type */}
                  <div>
                     <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Type
                     </label>
                     <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                     >
                        {notificationTypes.map((type) => (
                           <option key={type.value} value={type.value}>
                              {type.label}
                           </option>
                        ))}
                     </select>
                  </div>

                  {/* Additional Data (Optional) */}
                  <div>
                     <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Data (JSON - Optional)
                     </label>
                     <textarea
                        id="data"
                        name="data"
                        value={formData.data}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder='{"key": "value"}'
                     />
                     <p className="mt-1 text-sm text-gray-500">
                        Enter valid JSON data for additional notification information
                     </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end space-x-4">
                     <button
                        type="button"
                        onClick={() => setFormData({
                           title: '',
                           message: '',
                           type: 'general',
                           data: ''
                        })}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                     >
                        Clear
                     </button>
                     <button
                        type="submit"
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                     >
                        <Send className="h-4 w-4" />
                        <span>Send Notification</span>
                     </button>
                  </div>
               </form>
            </div>

            {/* Notification Guidelines */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
               <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                     <h3 className="text-lg font-medium text-blue-900 mb-2">
                        Notification Guidelines
                     </h3>
                     <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Keep titles concise and clear (max 200 characters)</li>
                        <li>• Messages should be informative and helpful (max 1000 characters)</li>
                        <li>• Choose appropriate notification types for better user experience</li>
                        <li>• Use additional data sparingly and only when necessary</li>
                        <li>• Test notifications before sending to all users</li>
                     </ul>
                  </div>
               </div>
            </div>

            {/* Quick Templates */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
               <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Templates</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                     onClick={() => setFormData({
                        title: 'New Product Available!',
                        message: 'Check out our latest products with special discounts. Limited time offer!',
                        type: 'general',
                        data: ''
                     })}
                     className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                     <div className="flex items-center space-x-2 mb-2">
                        <Package className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-gray-900">Product Announcement</span>
                     </div>
                     <p className="text-sm text-gray-600">Announce new products or special offers</p>
                  </button>

                  <button
                     onClick={() => setFormData({
                        title: 'Order Status Update',
                        message: 'Your order has been processed and is ready for shipment.',
                        type: 'order_update',
                        data: ''
                     })}
                     className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                     <div className="flex items-center space-x-2 mb-2">
                        <Bell className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-gray-900">Order Update</span>
                     </div>
                     <p className="text-sm text-gray-600">Notify users about order status changes</p>
                  </button>

                  <button
                     onClick={() => setFormData({
                        title: 'Price Drop Alert!',
                        message: 'Great news! Some of your favorite items are now on sale.',
                        type: 'price_change',
                        data: ''
                     })}
                     className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                     <div className="flex items-center space-x-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-gray-900">Price Change</span>
                     </div>
                     <p className="text-sm text-gray-600">Inform users about price changes</p>
                  </button>

                  <button
                     onClick={() => setFormData({
                        title: 'System Maintenance',
                        message: 'We will be performing scheduled maintenance. Some features may be temporarily unavailable.',
                        type: 'admin_notification',
                        data: ''
                     })}
                     className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                     <div className="flex items-center space-x-2 mb-2">
                        <Users className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-gray-900">System Alert</span>
                     </div>
                     <p className="text-sm text-gray-600">Notify users about system updates or issues</p>
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}

