'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
   LayoutDashboard,
   Users,
   ShoppingCart,
   Bell,
   Settings,
   X,
   LogOut,
   Shield,
   FileText
} from 'lucide-react';

interface AdminLayoutProps {
   children: React.ReactNode;
}

const navigation = [
   { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
   { name: 'Users', href: '/admin/users', icon: Users },
   { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
   { name: 'Notifications', href: '/admin/notifications', icon: Bell },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const pathname = usePathname();
   const { logout, user } = useAuth();

   const handleLogout = () => {
      logout();
   };

   return (
      <div className="min-h-screen bg-gray-50 flex">
         {/* Mobile sidebar overlay */}
         {sidebarOpen && (
            <div
               className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
               onClick={() => setSidebarOpen(false)}
            />
         )}

         {/* Sidebar */}
         <div className={`w-64 bg-white border-r border-gray-200 flex-shrink-0 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0 fixed inset-y-0 left-0 z-50' : '-translate-x-full lg:translate-x-0'
            }`}>
            <div className="flex flex-col h-full">
               {/* Logo */}
               <div className="flex items-center justify-between h-16 px-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                     <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                     </div>
                     <span className="text-xl font-bold text-gray-900">Admin Panel</span>
                  </div>
                  <button
                     onClick={() => setSidebarOpen(false)}
                     className="lg:hidden text-gray-400 hover:text-gray-600"
                  >
                     <X className="w-6 h-6" />
                  </button>
               </div>

               {/* Navigation */}
               <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                  {navigation.map((item) => {
                     const isActive = pathname === item.href;
                     return (
                        <Link
                           key={item.name}
                           href={item.href}
                           className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                           onClick={() => setSidebarOpen(false)}
                        >
                           <item.icon className="w-5 h-5" />
                           <span className="font-medium">{item.name}</span>
                        </Link>
                     );
                  })}
               </nav>

               {/* User section */}
               <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                     <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                           {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'A'}
                        </span>
                     </div>
                     <div>
                        <p className="text-gray-900 font-medium">
                           {user?.firstName && user?.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user?.username || 'Admin User'
                           }
                        </p>
                        <p className="text-gray-500 text-sm">{user?.email || 'admin@example.com'}</p>
                     </div>
                  </div>
                  <button
                     onClick={handleLogout}
                     className="flex items-center space-x-3 w-full px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                  >
                     <LogOut className="w-5 h-5" />
                     <span>Logout</span>
                  </button>
               </div>
            </div>
         </div>

         {/* Main content area */}
         <div className="flex-1 flex flex-col">

            {/* Page content */}
            <main className="flex-1 overflow-auto">
               {children}
            </main>
         </div>
      </div>
   );
}
