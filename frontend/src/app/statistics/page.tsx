'use client';

import React, { useState } from 'react';
import { BarChart3, DollarSign, Users, Package, TrendingUp, Calendar, Download } from 'lucide-react';
import { useGetStatisticsOverviewQuery, useGetSalesRevenueQuery, useGetCashFlowQuery, useGetCustomerMetricsQuery, useGetProductPerformanceQuery } from '@/store/api/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function StatisticsPage() {
   const [dateRange, setDateRange] = useState({
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
   });

   const { data: overview, isLoading: overviewLoading } = useGetStatisticsOverviewQuery();
   const { data: salesRevenue, isLoading: salesLoading } = useGetSalesRevenueQuery(dateRange);
   const { data: cashFlow, isLoading: cashFlowLoading } = useGetCashFlowQuery(dateRange);
   const { data: customerMetrics, isLoading: customerLoading } = useGetCustomerMetricsQuery(dateRange);
   const { data: productPerformance, isLoading: productLoading } = useGetProductPerformanceQuery(dateRange);

   const isLoading = overviewLoading || salesLoading || cashFlowLoading || customerLoading || productLoading;

   const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', {
         style: 'currency',
         currency: 'VND'
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

   return (
      <div className="min-h-screen bg-gray-50 py-8">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                     <BarChart3 className="h-8 w-8 text-blue-600" />
                     <h1 className="text-3xl font-bold text-gray-900">Statistics Dashboard</h1>
                  </div>
                  <div className="flex items-center space-x-4">
                     <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <input
                           type="date"
                           value={dateRange.startDate}
                           onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                           className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                           type="date"
                           value={dateRange.endDate}
                           onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                           className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                     </div>
                     <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                     </button>
                  </div>
               </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
               <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                     <div className="p-3 bg-green-100 rounded-full">
                        <DollarSign className="h-6 w-6 text-green-600" />
                     </div>
                     <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">
                           {formatCurrency(overview?.monthly?.completedRevenue || 0)}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                     <div className="p-3 bg-blue-100 rounded-full">
                        <Package className="h-6 w-6 text-blue-600" />
                     </div>
                     <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Monthly Orders</p>
                        <p className="text-2xl font-bold text-gray-900">
                           {formatNumber(overview?.monthly?.completedOrders || 0)}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                     <div className="p-3 bg-purple-100 rounded-full">
                        <Users className="h-6 w-6 text-purple-600" />
                     </div>
                     <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">New Customers</p>
                        <p className="text-2xl font-bold text-gray-900">
                           {formatNumber(overview?.newCustomersThisMonth || 0)}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                     <div className="p-3 bg-orange-100 rounded-full">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                     </div>
                     <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pending Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">
                           {formatCurrency(overview?.monthly?.pendingRevenue || 0)}
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Sales Revenue Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
               <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Revenue Summary</h2>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Revenue</span>
                        <span className="text-lg font-semibold text-green-600">
                           {formatCurrency(salesRevenue?.summary?.totalRevenue || 0)}
                        </span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Orders</span>
                        <span className="text-lg font-semibold text-blue-600">
                           {formatNumber(salesRevenue?.summary?.totalOrders || 0)}
                        </span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-600">Average Order Value</span>
                        <span className="text-lg font-semibold text-purple-600">
                           {formatCurrency(salesRevenue?.summary?.averageOrderValue || 0)}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Cash Flow Summary</h2>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-gray-600">Completed Revenue</span>
                        <span className="text-lg font-semibold text-green-600">
                           {formatCurrency(cashFlow?.summary?.completedRevenue || 0)}
                        </span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pending Revenue</span>
                        <span className="text-lg font-semibold text-orange-600">
                           {formatCurrency(cashFlow?.summary?.pendingRevenue || 0)}
                        </span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-600">Completed Orders</span>
                        <span className="text-lg font-semibold text-blue-600">
                           {formatNumber(cashFlow?.summary?.completedOrders || 0)}
                        </span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pending Orders</span>
                        <span className="text-lg font-semibold text-yellow-600">
                           {formatNumber(cashFlow?.summary?.pendingOrders || 0)}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Customer Metrics */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
               <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Metrics</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                     <p className="text-3xl font-bold text-blue-600">
                        {formatNumber(customerMetrics?.summary?.totalCustomers || 0)}
                     </p>
                     <p className="text-gray-600">Total Customers</p>
                  </div>
                  <div className="text-center">
                     <p className="text-3xl font-bold text-green-600">
                        {formatNumber(customerMetrics?.summary?.newCustomers || 0)}
                     </p>
                     <p className="text-gray-600">New Customers</p>
                  </div>
                  <div className="text-center">
                     <p className="text-3xl font-bold text-purple-600">
                        {formatNumber(customerMetrics?.summary?.activeCustomers || 0)}
                     </p>
                     <p className="text-gray-600">Active Customers</p>
                  </div>
               </div>
            </div>

            {/* Top 10 Best-Selling Products */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
               <h2 className="text-xl font-semibold text-gray-900 mb-4">Top 10 Best-Selling Products</h2>
               <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                        <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Sold
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Revenue
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Orders
                           </th>
                        </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {productPerformance?.topProducts?.map((product: any, index: number) => (
                           <tr key={product.id}>
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
                                 {product.category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                 {formatNumber(product.totalSold)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                 {formatCurrency(product.totalRevenue)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                 {formatNumber(product.orderCount)}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Recent Orders Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recently Delivered Orders</h2>
                  <div className="overflow-x-auto">
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
                                 Amount
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Date
                              </th>
                           </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {salesRevenue?.recentOrders?.slice(0, 5).map((order: any) => (
                              <tr key={order.id}>
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
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Customers</h2>
                  <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                           <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Customer
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Orders
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Total Spent
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Last Order
                              </th>
                           </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {customerMetrics?.topCustomers?.slice(0, 5).map((customer: any) => (
                              <tr key={customer.id}>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                       <div className="text-sm font-medium text-gray-900">{customer.username}</div>
                                       <div className="text-sm text-gray-500">{customer.email}</div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatNumber(customer.orderCount)}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatCurrency(customer.totalSpent)}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(customer.lastOrderDate).toLocaleDateString()}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

