'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, User, Calendar, MapPin, CreditCard, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useGetAdminOrderDetailsQuery, useUpdateAdminOrderStatusMutation } from '@/store/api/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { showToast } from '@/utils/toast';

export default function OrderDetailPage() {
   const params = useParams();
   const router = useRouter();
   const orderId = parseInt(params.id as string);

   // Fetch order details from API
   const { data: orderData, isLoading, error } = useGetAdminOrderDetailsQuery(orderId);
   const [updateOrderStatus] = useUpdateAdminOrderStatusMutation();

   // Extract order and items from API response
   const order = orderData?.order;
   const orderItems = orderData?.items || [];

   // Debug logging
   console.log('Order Detail Debug:', {
      orderId,
      isLoading,
      error,
      orderData,
      order,
      orderItems,
      orderStatus: order?.status
   });

   const statusOptions = [
      { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
      { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
      { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
      { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
      { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
   ];

   const getStatusIcon = (status: string) => {
      switch (status) {
         case 'pending': return <Clock className="h-4 w-4" />;
         case 'processing': return <Package className="h-4 w-4" />;
         case 'shipped': return <Truck className="h-4 w-4" />;
         case 'delivered': return <CheckCircle className="h-4 w-4" />;
         case 'completed': return <CheckCircle className="h-4 w-4" />;
         case 'cancelled': return <XCircle className="h-4 w-4" />;
         default: return <Clock className="h-4 w-4" />;
      }
   };

   const handleStatusChange = async (newStatus: string) => {
      try {
         await updateOrderStatus({ id: orderId, status: newStatus }).unwrap();
         showToast.success('Order status updated successfully');
      } catch {
         showToast.error('Failed to update order status');
      }
   };

   const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD'
      }).format(amount);
   };

   // Loading state
   if (isLoading) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <LoadingSpinner />
         </div>
      );
   }

   // Error state
   if (error || !order) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
               <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading order</h2>
               <p className="text-gray-600">Please try again later</p>
            </div>
         </div>
      );
   }

   const currentStatus = statusOptions.find(s => s.value === order?.status);

   // Debug status matching
   console.log('Status Debug:', {
      orderStatus: order?.status,
      statusOptions: statusOptions.map(s => s.value),
      currentStatus,
      found: statusOptions.find(s => s.value === order?.status)
   });

   return (
      <div className="bg-gray-50 p-6">
         <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
               <div className="flex items-center mb-6">
                  <button
                     onClick={() => router.back()}
                     className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mr-6"
                  >
                     <ArrowLeft className="h-5 w-5" />
                     <span>Back</span>
                  </button>
                  <div>
                     <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                     <p className="mt-2 text-sm text-gray-600">
                        Order #{order?.order_number}
                     </p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Order Summary */}
               <div className="lg:col-span-2 space-y-8">
                  {/* Order Status */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                     <div className='flex gap-6 items-center'>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h3>

                        <div className="flex items-center justify-between mb-6">
                           <div className={'flex items-center space-x-3  ${currentStatus?.color}'}>
                              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${currentStatus?.color}`}>
                                 {currentStatus?.label}
                              </span>
                           </div>

                           <select
                              value={order?.status || 'pending'}
                              onChange={(e) => handleStatusChange(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                           >
                              {statusOptions.map((status) => (
                                 <option key={status.value} value={status.value}>
                                    {status.label}
                                 </option>
                              ))}
                           </select>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                           <span className="text-gray-500">Order Date:</span>
                           <p className="font-medium text-gray-900">
                              {order?.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                           </p>
                        </div>
                        <div>
                           <span className="text-gray-500">Last Updated:</span>
                           <p className="font-medium text-gray-900">
                              {order?.updated_at ? new Date(order.updated_at).toLocaleDateString() : 'N/A'}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                     <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h3>

                     <div className="space-y-4">
                        {orderItems.map((item: any) => (
                           <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                 <Package className="h-8 w-8 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                 <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                                 <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                 <p className="font-medium text-gray-900">{formatCurrency(parseFloat(item.price))}</p>
                                 <p className="text-sm text-gray-500">each</p>
                              </div>
                           </div>
                        ))}
                        {orderItems.length === 0 && (
                           <div className="text-center py-8 text-gray-500">
                              No items found
                           </div>
                        )}
                     </div>

                     <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-center text-lg font-semibold">
                           <span>Total:</span>
                           <span className="text-blue-600">{formatCurrency(parseFloat(order?.total_amount || '0'))}</span>
                        </div>
                     </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                     <h3 className="text-lg font-semibold text-gray-900 mb-6">Shipping Address</h3>

                     <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                        <div>
                           <p className="font-medium text-gray-900">{order?.username}</p>
                           <p className="text-gray-600">{order?.shipping_address}</p>
                           <p className="text-gray-600">{order?.phone}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Order Information Sidebar */}
               <div className="space-y-8">
                  {/* Customer Information */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                     <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Information</h3>

                     <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                           <User className="h-5 w-5 text-gray-400" />
                           <div>
                              <p className="font-medium text-gray-900">{order?.username}</p>
                              <p className="text-sm text-gray-500">Customer ID: {order?.user_id}</p>
                           </div>
                        </div>

                        <div className="flex items-center space-x-3">
                           <Calendar className="h-5 w-5 text-gray-400" />
                           <div>
                              <p className="text-sm text-gray-900">{order?.email}</p>
                              <p className="text-sm text-gray-500">{order?.phone}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                     <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Information</h3>

                     <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                           <CreditCard className="h-5 w-5 text-gray-400" />
                           <div>
                              <p className="font-medium text-gray-900">{order?.payment_method || 'Credit Card'}</p>
                              <p className="text-sm text-gray-500">Payment Method</p>
                           </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                           <div className="flex justify-between items-center">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-medium text-gray-900">{formatCurrency(parseFloat(order?.total_amount || '0'))}</span>
                           </div>
                           <div className="flex justify-between items-center mt-2">
                              <span className="text-gray-600">Shipping:</span>
                              <span className="font-medium text-gray-900">Free</span>
                           </div>
                           <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                              <span className="font-semibold text-gray-900">Total:</span>
                              <span className="font-semibold text-blue-600">{formatCurrency(parseFloat(order?.total_amount || '0'))}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Order Notes */}
                  {order.notes && (
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Notes</h3>
                        <p className="text-gray-600">{order.notes}</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
