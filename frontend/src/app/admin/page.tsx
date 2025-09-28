'use client';

import React from 'react';
import { BarChart3, DollarSign, Users, Package, TrendingUp, Download } from 'lucide-react';
import { useGetAdminDashboardQuery } from '@/store/api/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AdminDashboard() {
   const { data: dashboardData, isLoading, error } = useGetAdminDashboardQuery();

   // Debug: Log the data to see what we're getting
   console.log('Dashboard data:', dashboardData);

   const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD'
      }).format(amount);
   };

   const formatNumber = (num: number) => {
      return new Intl.NumberFormat('vi-VN').format(num);
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
               <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading dashboard</h2>
               <p className="text-gray-600">Please try again later</p>
            </div>
         </div>
      );
   }

   return (
      <div className="bg-gray-50 p-6">
         <div className="max-w-7xl mx-auto">
            <div className="space-y-10">
               {/* Header */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                     <BarChart3 className="h-8 w-8 text-blue-600" />
                     <h1 className="text-3xl font-bold text-gray-900">Statistics Dashboard</h1>
                  </div>
                  <div className="flex items-center space-x-4">
                     <button className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                     </button>
                  </div>
               </div>

               {/* Overview Cards */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                     <div className="flex items-center">
                        <div className="p-4 bg-green-100 rounded-full">
                           <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                           <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                           <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(dashboardData?.monthly?.completedRevenue || 0)}
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                     <div className="flex items-center">
                        <div className="p-4 bg-blue-100 rounded-full">
                           <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                           <p className="text-sm font-medium text-gray-600">Monthly Orders</p>
                           <p className="text-2xl font-bold text-gray-900">
                              {formatNumber(dashboardData?.monthly?.completedOrders || 0)}
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                     <div className="flex items-center">
                        <div className="p-4 bg-purple-100 rounded-full">
                           <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                           <p className="text-sm font-medium text-gray-600">New Customers</p>
                           <p className="text-2xl font-bold text-gray-900">
                              {formatNumber(dashboardData?.newCustomersThisMonth || 0)}
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                     <div className="flex items-center">
                        <div className="p-4 bg-orange-100 rounded-full">
                           <TrendingUp className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                           <p className="text-sm font-medium text-gray-600">Pending Revenue</p>
                           <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(dashboardData?.monthly?.pendingRevenue || 0)}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Sales Revenue Section */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                     <h2 className="text-xl font-semibold text-gray-900 mb-6">Sales Revenue Summary</h2>
                     <div className="space-y-6">
                        <div className="flex justify-between items-center">
                           <span className="text-gray-600">Total Revenue</span>
                           <span className="text-lg font-semibold text-green-600">
                              {formatCurrency(dashboardData?.yearly?.completedRevenue || 0)}
                           </span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-gray-600">Total Orders</span>
                           <span className="text-lg font-semibold text-blue-600">
                              {formatNumber(dashboardData?.yearly?.completedOrders || 0)}
                           </span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-gray-600">Average Order Value</span>
                           <span className="text-lg font-semibold text-purple-600">
                              {formatCurrency(dashboardData?.yearly?.completedRevenue / Math.max(dashboardData?.yearly?.completedOrders || 1, 1) || 0)}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                     <h2 className="text-xl font-semibold text-gray-900 mb-6">Cash Flow Summary</h2>
                     <div className="space-y-6">
                        <div className="flex justify-between items-center">
                           <span className="text-gray-600">Completed Revenue</span>
                           <span className="text-lg font-semibold text-green-600">
                              {formatCurrency(dashboardData?.monthly?.completedRevenue || 0)}
                           </span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-gray-600">Pending Revenue</span>
                           <span className="text-lg font-semibold text-orange-600">
                              {formatCurrency(dashboardData?.monthly?.pendingRevenue || 0)}
                           </span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-gray-600">Completed Orders</span>
                           <span className="text-lg font-semibold text-blue-600">
                              {formatNumber(dashboardData?.monthly?.completedOrders || 0)}
                           </span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-gray-600">Pending Orders</span>
                           <span className="text-lg font-semibold text-yellow-600">
                              {formatNumber(dashboardData?.monthly?.pendingOrders || 0)}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Customer Metrics */}
               <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Metrics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">
                           {formatNumber(dashboardData?.totalUsers || 0)}
                        </p>
                        <p className="text-gray-600">Total Customers</p>
                     </div>
                     <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">
                           {formatNumber(dashboardData?.newCustomersThisMonth || 0)}
                        </p>
                        <p className="text-gray-600">New Customers</p>
                     </div>
                     <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600">
                           {formatNumber(dashboardData?.totalUsers || 0)}
                        </p>
                        <p className="text-gray-600">Active Customers</p>
                     </div>
                  </div>
               </div>

               {/* Top 10 Best-Selling Products */}
               <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Top 10 Best-Selling Products</h2>
                  <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                           <tr>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Product
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Category
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Total Sold
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Revenue
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Orders
                              </th>
                           </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {dashboardData?.topProductsThisMonth?.map((product: any, index: number) => (
                              <tr key={product.id || `product-${index}`}>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                       <div className="flex-shrink-0 h-10 w-10">
                                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                             <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                                          </div>
                                       </div>
                                       <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                          <div className="text-sm text-gray-500">{product.brand}</div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {product.categoryName || 'N/A'}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatNumber(product.totalSold || 0)}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatCurrency(product.totalRevenue || 0)}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatNumber(product.orderCount || 0)}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Recent Orders Tables */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                     <h2 className="text-xl font-semibold text-gray-900 mb-6">Recently Delivered Orders</h2>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                           <thead className="bg-gray-50">
                              <tr>
                                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order
                                 </th>
                                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                 </th>
                                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                 </th>
                                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                 </th>
                              </tr>
                           </thead>
                           <tbody className="bg-white divide-y divide-gray-200">
                              {dashboardData?.recentOrders?.length > 0 ? (
                                 dashboardData.recentOrders.slice(0, 5).map((order: any, index: number) => (
                                    <tr key={order.id || `order-${index}`}>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                          {order.order_number}
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {order.username}
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {formatCurrency(order.total_amount)}
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {new Date(order.created_at).toLocaleDateString()}
                                       </td>
                                    </tr>
                                 ))
                              ) : (
                                 <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                       No recent orders found
                                    </td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                     <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Customers</h2>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                           <thead className="bg-gray-50">
                              <tr>
                                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                 </th>
                                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Orders
                                 </th>
                                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Spent
                                 </th>
                                 <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Order
                                 </th>
                              </tr>
                           </thead>
                           <tbody className="bg-white divide-y divide-gray-200">
                              {dashboardData?.topCustomers?.length > 0 ? (
                                 dashboardData.topCustomers.slice(0, 5).map((customer: any, index: number) => (
                                    <tr key={customer.id || `customer-${index}`}>
                                       <td className="px-6 py-4 whitespace-nowrap">
                                          <div>
                                             <div className="text-sm font-medium text-gray-900">{customer.username}</div>
                                             <div className="text-sm text-gray-500">{customer.email}</div>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {formatNumber(customer.order_count)}
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {formatCurrency(customer.total_spent)}
                                       </td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {new Date(customer.last_order_date).toLocaleDateString()}
                                       </td>
                                    </tr>
                                 ))
                              ) : (
                                 <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                       No customer data found
                                    </td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}