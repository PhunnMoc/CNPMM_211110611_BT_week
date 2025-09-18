"use client"

import { useEffect, useMemo, useState } from 'react'
import { SmartImage } from '@/components/SmartImage'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/utils/toast'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface OrderItem {
   id: number
   product_id: number
   name: string
   sku: string
   quantity: number
   price: number
   image?: string | null
}

interface OrderDetail {
   id: number
   order_number: string
   status: string
   total_amount: number
   payment_status: string
   shipping_address: string
   billing_address?: string | null
   payment_method?: string | null
   notes?: string | null
   created_at: string
   updated_at: string
   items: OrderItem[]
}

export default function OrderDetailPage() {
   const params = useParams()
   const router = useRouter()
   const orderId = useMemo(() => Number(params?.id), [params])
   const { token } = useAuth()
   const [order, setOrder] = useState<OrderDetail | null>(null)
   const [loading, setLoading] = useState(true)
   const [cancelling, setCancelling] = useState(false)

   useEffect(() => {
      if (!token || !orderId) return
      const controller = new AbortController()
      async function load() {
         try {
            setLoading(true)
            const res = await fetch(`/api/orders/${orderId}`, {
               headers: { Authorization: `Bearer ${token}` },
               signal: controller.signal,
            })
            if (!res.ok) {
               const err = await res.json().catch(() => ({}))
               throw new Error(err.message || 'Failed to load order')
            }
            const json = await res.json()
            setOrder(json)
         } catch (e) {
            if (e instanceof DOMException) return
            showToast.error((e as any)?.message || 'Failed to load order')
         } finally {
            setLoading(false)
         }
      }
      load()
      return () => controller.abort()
   }, [token, orderId])

   async function onCancel() {
      if (!token || !order) return
      if (!confirm('Cancel this order?')) return
      try {
         setCancelling(true)
         const res = await fetch(`/api/orders/${order.id}/cancel`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
         })
         if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || 'Failed to cancel order')
         }
         showToast.success('Order cancelled')
         // Refresh page data
         router.refresh?.()
         setOrder({ ...order, status: 'cancelled' })
      } catch (e) {
         showToast.error((e as any)?.message || 'Failed to cancel order')
      } finally {
         setCancelling(false)
      }
   }

   const canCancel = order && order.status !== 'cancelled' && order.status !== 'delivered'

   return (
      <div className="min-h-screen bg-cosmic">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
            <div className="flex items-center justify-between mb-6">
               <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Order Detail</h1>
                  {order && <div className="text-white/70">{order.order_number}</div>}
               </div>
               <div className="flex items-center gap-2">
                  <Link href="/orders/history" className="btn-primary rounded-full">History</Link>
                  <Link href="/orders" className="btn-primary rounded-full">Back to orders</Link>
               </div>
            </div>

            {loading ? (
               <div className="glass-card p-6"><LoadingSpinner text="Loading order..." /></div>
            ) : !order ? (
               <div className="glass-card p-6">Order not found.</div>
            ) : (
               <div className="space-y-6">
                  <div className="glass-card p-6 grid md:grid-cols-2 gap-6">
                     <div>
                        <div className="font-semibold mb-1">Status</div>
                        <div className="capitalize">{order.status}</div>
                     </div>
                     <div>
                        <div className="font-semibold mb-1">Placed on</div>
                        <div>{new Date(order.created_at).toLocaleString()}</div>
                     </div>
                     <div>
                        <div className="font-semibold mb-1">Payment</div>
                        <div className="capitalize">{order.payment_status} {order.payment_method ? `• ${order.payment_method}` : ''}</div>
                     </div>
                     <div>
                        <div className="font-semibold mb-1">Total</div>
                        <div className="font-bold">${Number(order.total_amount).toFixed(2)}</div>
                     </div>
                  </div>

                  <div className="glass-card p-6">
                     <div className="font-semibold mb-2">Shipping address</div>
                     <div className="whitespace-pre-wrap text-white/80">{order.shipping_address}</div>
                  </div>

                  <div className="glass-card p-6">
                     <div className="flex items-center justify-between mb-4">
                        <div className="font-semibold">Items</div>
                        {canCancel && (
                           <button className="btn-primary rounded-full disabled:opacity-60" disabled={cancelling} onClick={onCancel}>
                              {cancelling ? 'Cancelling...' : 'Cancel order'}
                           </button>
                        )}
                     </div>
                     <div className="divide-y divide-white/10">
                        {order.items.map((it) => (
                           <div key={it.id} className="py-4 flex items-center gap-4">
                              {it.image ? (
                                 <SmartImage src={it.image} alt={it.name} width={64} height={64} className="rounded-md object-cover" />
                              ) : (
                                 <div className="w-16 h-16 bg-white/10 rounded-md" />
                              )}
                              <div className="flex-1">
                                 <div className="font-medium">{it.name}</div>
                                 <div className="text-white/60 text-sm">SKU: {it.sku}</div>
                              </div>
                              <div className="w-32 text-right">
                                 <div className="text-white/80">x{it.quantity}</div>
                                 <div className="font-semibold">${Number(it.price * it.quantity).toFixed(2)}</div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   )
}


