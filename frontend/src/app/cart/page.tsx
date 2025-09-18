"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCartAPI } from '@/hooks/useCartAPI'
import { useAuth } from '@/hooks/useAuth'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { showToast } from '@/utils/toast'
import { LoadingButton, LoadingSpinner } from '@/components/LoadingSpinner'

export default function CartPage() {
   const router = useRouter()
   const { items, updateQuantity, removeItem, clearCart, totalPrice, isLoading } = useCartAPI()
   const { isAuthenticated, token } = useAuth()
   const [shippingAddress, setShippingAddress] = useState('')
   const [notes, setNotes] = useState('')
   const [placing, setPlacing] = useState(false)

   // Redirect to home page if user is not authenticated
   useEffect(() => {
      if (!isAuthenticated) {
         router.push('/')
      }
   }, [isAuthenticated, router])

   function checkout() {
      if (items.length === 0) {
         showToast.warning('Your cart is empty')
         return
      }
      showToast.info('Please fill the form below to place a COD order')
   }

   async function placeOrderCOD() {
      if (!shippingAddress.trim()) {
         showToast.error('Please enter shipping address')
         return
      }
      try {
         setPlacing(true)
         const res = await fetch('/api/orders', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
               shippingAddress,
               billingAddress: shippingAddress,
               paymentMethod: 'COD',
               notes: notes || undefined,
            })
         })
         if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || 'Failed to place order')
         }
         const data = await res.json()
         showToast.success('Order placed successfully')
         await clearCart()
         router.push('/orders')
      } catch (e: any) {
         showToast.error(e.message || 'Order failed')
      } finally {
         setPlacing(false)
      }
   }

   return (
      <div className="min-h-screen bg-cosmic">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
            <div className="flex items-center justify-between mb-6">
               <h1 className="text-2xl md:text-3xl font-bold">Your Cart</h1>
               <Link href="/products" className="btn-primary rounded-full">Continue shopping</Link>
            </div>

            {isLoading ? (
               <div className="glass-card p-6 text-center">
                  <LoadingSpinner />
                  <p className="text-white/80 mt-2">Loading your cart...</p>
               </div>
            ) : items.length === 0 ? (
               <div className="glass-card p-6 text-center">
                  <p className="text-white/80 text-lg">Your cart is empty</p>
                  <Link href="/products" className="btn-primary rounded-full mt-4">Start Shopping</Link>
               </div>
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                     {items.map((item: any) => (
                        <div key={item.id} className="glass-card p-4 flex items-center gap-4">
                           {item.image ? (
                              <Image src={item.image} alt={item.name} width={80} height={80} className="rounded object-cover" unoptimized loader={({ src }) => src} />
                           ) : (
                              <div className="h-20 w-20 rounded bg-white/10" />
                           )}
                           <div className="flex-1">
                              <div className="font-semibold">{item.name}</div>
                              <div className="text-white/70 text-sm">${Number(item.price).toFixed(2)}</div>
                           </div>
                           <div className="inline-flex items-center bg-white/10 border border-white/20 rounded-full">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2"><Minus className="h-4 w-4" /></button>
                              <span className="px-4">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2"><Plus className="h-4 w-4" /></button>
                           </div>
                           <button onClick={() => removeItem(item.id)} className="p-2 hover:text-red-300"><Trash2 className="h-5 w-5" /></button>
                        </div>
                     ))}
                  </div>
                  <div>
                     <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                           <span className="text-white/80">Subtotal</span>
                           <span className="font-bold">${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="space-y-3 mb-4">
                           <label className="block text-sm text-white/80">Shipping Address</label>
                           <textarea
                              value={shippingAddress}
                              onChange={(e) => setShippingAddress(e.target.value)}
                              placeholder="Enter your address"
                              className="w-full rounded-lg bg-white/10 border border-white/20 p-2 text-white"
                              rows={3}
                           />
                           <label className="block text-sm text-white/80">Notes (optional)</label>
                           <input
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Any additional notes"
                              className="w-full rounded-lg bg-white/10 border border-white/20 p-2 text-white"
                           />
                        </div>
                        <LoadingButton
                           className="btn-primary w-full rounded-full mb-3"
                           onClick={placeOrderCOD}
                           isLoading={placing}
                        >
                           Place Order (COD)
                        </LoadingButton>
                        <LoadingButton
                           className="w-full rounded-full bg-white/10 border border-white/20 px-4 py-2"
                           onClick={clearCart}
                           isLoading={false}
                        >
                           Clear Cart
                        </LoadingButton>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   )
}



