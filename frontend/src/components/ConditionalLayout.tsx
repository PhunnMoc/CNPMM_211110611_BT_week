'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/authSlice';
import AdminLayout from '@/components/AdminLayout';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface ConditionalLayoutProps {
   children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
   const user = useAppSelector(selectUser);
   const pathname = usePathname();
   const router = useRouter();

   // Define admin-only routes
   const adminRoutes = ['/admin'];
   const isAdminRoute = pathname.startsWith('/admin');

   // Define regular user routes that admins shouldn't access
   const regularUserRoutes = ['/products', '/cart', '/orders', '/profile', '/notifications'];
   const isRegularUserRoute = regularUserRoutes.some(route => pathname.startsWith(route));

   useEffect(() => {
      // If user is authenticated and we have their role
      if (user) {
         // If admin is trying to access regular user routes, redirect to admin dashboard
         if (user.isAdmin && isRegularUserRoute) {
            router.push('/admin');
            return;
         }

         // If regular user is trying to access admin routes, redirect to home
         if (!user.isAdmin && isAdminRoute) {
            router.push('/');
            return;
         }

         // If admin visits home page, redirect to admin dashboard
         if (user.isAdmin && pathname === '/') {
            router.push('/admin');
            return;
         }
      }
   }, [user, pathname, router, isAdminRoute, isRegularUserRoute]);

   // If user is admin and on admin route, use admin layout
   if (user?.isAdmin && isAdminRoute) {
      return <AdminLayout>{children}</AdminLayout>;
   }

   // If user is admin but not on admin route, show loading while redirecting
   if (user?.isAdmin && !isAdminRoute) {
      return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to admin dashboard...</p>
         </div>
      </div>;
   }

   // Otherwise, render children with regular layout (Header + Footer)
   return (
      <>
         <Header />
         <main>
            {children}
         </main>
         <Footer />
      </>
   );
}
