"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { showToast } from '@/utils/toast'

type Order = {
   id: number
   order_number: string
   status: string
   total_amount: number
   payment_status: string
   created_at: string
   item_count: number
}

const statusOptions = [
   { value: '', label: 'All' },
   { value: 'pending', label: 'Pending' },
   { value: 'processing', label: 'Processing' },
   { value: 'shipped', label: 'Shipped' },
   { value: 'delivered', label: 'Delivered' },
   { value: 'completed', label: 'Completed' },
   { value: 'cancelled', label: 'Cancelled' },
]

export default function OrdersHistoryPage() {
   const { token } = useAuth()
   const [orders, setOrders] = useState<Order[]>([])
   const [status, setStatus] = useState<string>('')
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      if (!token) return
      const controller = new AbortController()
      async function load() {
         try {
            setLoading(true)
            const qs = new URLSearchParams()
            if (status) qs.set('status', status)
            const res = await fetch(`/api/orders?${qs.toString()}`, {
               headers: { Authorization: `Bearer ${token}` },
               signal: controller.signal,
            })
            if (!res.ok) {
               const err = await res.json().catch(() => ({}))
               throw new Error(err.message || 'Failed to load history')
            }
            const json = await res.json()
            setOrders(json.orders || [])
         } catch (e) {
            if (e instanceof DOMException) return
            const message = e instanceof Error ? e.message : 'Failed to load history'
            showToast.error(message)
         } finally {
            setLoading(false)
         }
      }
      load()
      return () => controller.abort()
   }, [token, status])

   return (
      <div className="min-h-screen bg-cosmic">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
            <div className="flex items-center justify-between mb-6">
               <h1 className="text-2xl md:text-3xl font-bold">Order History</h1>
               <Link href="/" className="btn-primary rounded-full">Home</Link>
            </div>

            <div className="glass-card p-4 mb-6 flex items-center gap-3">
               <label htmlFor="status" className="text-white/80">Status</label>
               <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-transparent border border-white/20 rounded-md px-3 py-2"
               >
                  {statusOptions.map((opt) => (
                     <option key={opt.value} value={opt.value} className="bg-black">
                        {opt.label}
                     </option>
                  ))}
               </select>
            </div>

            {loading ? (
               <div className="glass-card p-6"><LoadingSpinner text="Loading orders..." /></div>
            ) : orders.length === 0 ? (
               <div className="glass-card p-6">No orders found.</div>
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
         </div>
      </div>
   )
}


