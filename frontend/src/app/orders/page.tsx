"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/utils/toast'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { OrderSummary } from '@/types/orderTypes'

export default function OrdersPage() {
   const { token } = useAuth()
   const [orders, setOrders] = useState<OrderSummary[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      if (!token) return
      const controller = new AbortController()
      async function load() {
         try {
            setLoading(true)
            const res = await fetch(`/api/orders`, {
               headers: { Authorization: `Bearer ${token}` },
               signal: controller.signal,
            })
            if (!res.ok) {
               const err = await res.json().catch(() => ({}))
               throw new Error(err.message || 'Failed to load orders')
            }
            const json = await res.json()
            setOrders(json.orders || [])
         } catch (e) {
            if (e instanceof DOMException) return
            const message = e instanceof Error ? e.message : 'Failed to load orders'
            showToast.error(message)
         } finally {
            setLoading(false)
         }
      }
      load()
      return () => controller.abort()
   }, [token])

   function fakeCheckout() {
      showToast.info('Checkout is not implemented yet')
   }

   return (
      <div className="min-h-screen bg-cosmic">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
            <div className="flex items-center justify-between mb-6">
               <h1 className="text-2xl md:text-3xl font-bold">My Orders</h1>
               <div className="flex items-center gap-2">
                  <Link href="/orders/history" className="btn-primary rounded-full">History</Link>
                  <Link href="/" className="btn-primary rounded-full">Home</Link>
               </div>
            </div>
            {loading ? (
               <div className="glass-card p-6">
                  <LoadingSpinner text="Loading orders..." />
               </div>
            ) : orders.length === 0 ? (
               <div className="glass-card p-6">No orders yet.</div>
            ) : (
               <div className="space-y-4">
                  {orders.map((o) => (
                     <Link key={o.id} href={`/orders/${o.id}`} className="glass-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div>
                           <div className="font-semibold">{o.order_number}</div>
                           <div className="text-white/70 text-sm">{new Date(o.created_at).toLocaleString()} • {o.item_count} items</div>
                        </div>
                        <div className="text-right">
                           <div className="font-bold">${Number(o.total_amount).toFixed(2)}</div>
                           <div className="text-white/70 text-sm capitalize">{o.status}</div>
                        </div>
                     </Link>
                  ))}
               </div>
            )}

            <div className="mt-8 flex justify-end">
               <button className="btn-primary rounded-full" onClick={fakeCheckout}>Proceed to checkout</button>
            </div>
         </div>
      </div>
   )
}


