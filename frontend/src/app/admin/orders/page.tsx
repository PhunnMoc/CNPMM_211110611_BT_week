'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search } from 'lucide-react';
import { useGetAdminOrdersQuery } from '@/store/api/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AdminOrders() {
   const router = useRouter();
   const [searchTerm, setSearchTerm] = useState('');
   const [statusFilter, setStatusFilter] = useState('');

   // Fetch orders from API
   const { data: ordersData, isLoading, error } = useGetAdminOrdersQuery({
      page: 1,
      limit: 50,
      status: statusFilter || undefined
   });

   const orders = ordersData?.orders || [];

   // Transform orders to include items count from the items array
   const ordersWithItemCount = orders.map((orderData: any) => {
      const order = orderData.order || orderData;
      const items = orderData.items || [];
      return {
         ...order,
         items_count: items.length,
         items: items
      };
   });

   const filteredOrders = ordersWithItemCount.filter((order: any) =>
      (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.email || '').toLowerCase().includes(searchTerm.toLowerCase())
   );

   // Debug logging for orders data
   console.log('Orders Debug:', {
      ordersData,
      orders,
      ordersWithItemCount,
      firstOrder: ordersWithItemCount[0],
      orderKeys: ordersWithItemCount[0] ? Object.keys(ordersWithItemCount[0]) : []
   });

   const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD'
      }).format(amount);
   };

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'completed':
            return 'bg-green-100 text-green-800';
         case 'pending':
            return 'bg-yellow-100 text-yellow-800';
         case 'processing':
            return 'bg-blue-100 text-blue-800';
         case 'shipped':
            return 'bg-purple-100 text-purple-800';
         case 'delivered':
            return 'bg-indigo-100 text-indigo-800';
         case 'cancelled':
            return 'bg-red-100 text-red-800';
         default:
            return 'bg-gray-100 text-gray-800';
      }
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
   if (error) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
               <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading orders</h2>
               <p className="text-gray-600">Please try again later</p>
            </div>
         </div>
      );
   }

   return (
      <div className="bg-gray-50 p-6">
         <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
               <p className="mt-1 text-sm text-gray-500">
                  Track and manage customer orders
               </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                     type="text"
                     placeholder="Search orders..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
               </div>
               <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
               >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
               </select>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                     <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Date
                        </th>
                     </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {filteredOrders.map((order: any) => {
                        return (
                           <tr key={order.id} className="hover:bg-gray-50">
                              <td
                                 className="px-6 py-4 whitespace-nowrap"
                                 onClick={() => router.push(`/admin/orders/${order.id}`)}>
                                 <div
                                    className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                 >
                                    <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div>
                                    <div className="text-sm font-medium text-gray-900">{order.username}</div>
                                    <div className="text-sm text-gray-500">{order.email}</div>
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="flex items-center space-x-2">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                       {order.status}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                 {formatCurrency(order.total_amount || 0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                 {new Date(order.created_at).toLocaleDateString()}
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>

            {/* Empty State */}
            {filteredOrders.length === 0 && (
               <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria.</p>
               </div>
            )}
         </div>
      </div>
   );
}