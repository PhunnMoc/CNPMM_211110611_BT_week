'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, User, Search, Menu, X, LogOut, Package, UserRound, Bell } from 'lucide-react'
import { useCartAPI } from '@/hooks/useCartAPI'
import { useAuth } from '@/hooks/useAuth'
import { SmartImage } from '@/components/SmartImage'
import { NotificationDropdown } from '@/components/NotificationDropdown'

export function Header() {
   const [isMenuOpen, setIsMenuOpen] = useState(false)
   const [search, setSearch] = useState('')
   const router = useRouter()
   const { totalItems } = useCartAPI()
   const { user, logout, isAuthenticated } = useAuth()

   return (
      <header className="sticky top-0 z-50 bg-[#0b061a]/70 backdrop-blur-xl border-b border-white/20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 gap-4 md:gap-8">
               {/* Logo */}
               <Link href="/" className="flex items-center">
                  <span className="text-2xl font-bold text-white">Shop</span>
               </Link>

               {/* Desktop Navigation */}
               <nav className="hidden md:flex space-x-8 ml-4 md:ml-8">
                  <Link href="/" className="text-white/80 hover:text-white font-medium">
                     Home
                  </Link>
                  <Link href="/products" className="text-white/80 hover:text-white font-medium">
                     Products
                  </Link>
                  <Link href="/categories" className="text-white/80 hover:text-white font-medium">
                     Categories
                  </Link>
                  <Link href="/about" className="text-white/80 hover:text-white font-medium">
                     About
                  </Link>
               </nav>

               {/* Search Bar */}
               <div className="hidden md:flex flex-1 max-w-xl mx-4 md:mx-8">
                  <div className="relative w-full">
                     <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                              const q = search.trim()
                              if (q.length > 0) router.push(`/products?q=${encodeURIComponent(q)}`)
                           }
                        }}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                     />
                     <Search className="absolute left-4 top-2.5 h-5 w-5 text-white/70" />
                  </div>
               </div>

               {/* Right side icons */}
               <div className="flex items-center space-x-4">
                  {/* Notifications - only show when user is authenticated */}
                  {isAuthenticated && <NotificationDropdown />}

                  {/* Cart - only show when user is authenticated */}
                  {isAuthenticated && (
                     <Link href="/cart" className="relative p-2 text-white/80 hover:text-white">
                        <ShoppingCart className="h-6 w-6" />
                        {totalItems > 0 && (
                           <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {totalItems}
                           </span>
                        )}
                     </Link>
                  )}

                  {/* User Menu */}
                  <div className="hidden sm:flex items-center space-x-3 text-white/80">
                     {user ? (
                        <div className="relative group">
                           <button className="flex items-center gap-2 hover:text-white">
                              {user.avatarUrl ? (
                                 <SmartImage
                                    src={user.avatarUrl}
                                    alt={user.username || user.email || 'Avatar'}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white/20"
                                 />
                              ) : (
                                 <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <UserRound className="h-5 w-5" />
                                 </div>
                              )}
                              <span className="max-w-[140px] truncate">{user.username || user.email}</span>
                           </button>
                           <div className="absolute right-0 mt-2 w-56 text-white/90 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                              <div className="overflow-hidden rounded-xl border border-white/15 bg-[#0b061a]/90 backdrop-blur-xl shadow-xl">
                                 <div className="px-4 py-3 flex items-center gap-3 border-b border-white/10">
                                    {user.avatarUrl ? (
                                       <SmartImage src={user.avatarUrl} alt="Avatar" width={36} height={36} className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10" />
                                    ) : (
                                       <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
                                          <UserRound className="h-5 w-5" />
                                       </div>
                                    )}
                                    <div className="min-w-0">
                                       <div className="font-medium text-white truncate">{user.username || user.email}</div>
                                       <div className="text-xs text-white/60 truncate">{user.email}</div>
                                    </div>
                                 </div>
                                 <div className="py-1">
                                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-white/10">
                                       <UserRound className="h-4 w-4" />
                                       <span>Profile</span>
                                    </Link>
                                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-white/10">
                                       <Package className="h-4 w-4" />
                                       <span>Orders</span>
                                    </Link>
                                    <Link href="/orders/history" className="flex items-center gap-2 px-4 py-2 hover:bg-white/10">
                                       <Package className="h-4 w-4" />
                                       <span>Order History</span>
                                    </Link>
                                    <Link href="/notifications" className="flex items-center gap-2 px-4 py-2 hover:bg-white/10">
                                       <Bell className="h-4 w-4" />
                                       <span>Notifications</span>
                                    </Link>
                                 </div>
                                 <div className="border-t border-white/10">
                                    <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-white/10">
                                       <LogOut className="h-4 w-4" />
                                       <span>Logout</span>
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <>
                           <User className="h-6 w-6" />
                           <Link href="/auth/signin" className="hover:text-white font-medium">Sign In</Link>
                           <Link href="/auth/signup" className="btn-primary rounded-full">Sign Up</Link>
                        </>
                     )}
                  </div>

                  {/* Mobile menu button */}
                  <button
                     onClick={() => setIsMenuOpen(!isMenuOpen)}
                     className="md:hidden p-2 text-white/80 hover:text-white"
                  >
                     {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </button>
               </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
               <div className="md:hidden border-t border-white/20 py-4 bg-white/5">
                  <nav className="flex flex-col space-y-4">
                     <Link href="/" className="text-white/80 hover:text-white font-medium">
                        Home
                     </Link>
                     <Link href="/products" className="text-white/80 hover:text-white font-medium">
                        Products
                     </Link>
                     <Link href="/categories" className="text-white/80 hover:text-white font-medium">
                        Categories
                     </Link>
                     <Link href="/about" className="text-white/80 hover:text-white font-medium">
                        About
                     </Link>
                     <div className="pt-4 border-t border-white/20">
                        <input
                           type="text"
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                 const q = search.trim()
                                 if (q.length > 0) {
                                    router.push(`/products?q=${encodeURIComponent(q)}`)
                                    setIsMenuOpen(false)
                                 }
                              }
                           }}
                           placeholder="Search products..."
                           className="w-full px-3 py-2 bg-white/10 text-white placeholder-white/60 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="mt-3 flex items-center space-x-3">
                           <Link href="/auth/signin" className="text-white/80 hover:text-white font-medium">
                              Sign In
                           </Link>
                           <Link href="/auth/signup" className="btn-primary">
                              Sign Up
                           </Link>
                        </div>
                     </div>
                  </nav>
               </div>
            )}
         </div>
      </header>
   )
}
