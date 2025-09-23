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
   const [couponCode, setCouponCode] = useState('')
   const [pointsToRedeem, setPointsToRedeem] = useState(0)
   const [pointsBalance, setPointsBalance] = useState<number | null>(null)
   const [coupons, setCoupons] = useState<any[] | null>(null)
   const selectedCoupon = (coupons || []).find((c: any) => c.code === couponCode)

   // Derived discounts preview
   const couponDiscount = (() => {
      if (!selectedCoupon) return 0
      const meetsMin = !selectedCoupon.min_order_amount || totalPrice >= Number(selectedCoupon.min_order_amount)
      if (!meetsMin) return 0
      return selectedCoupon.discount_type === 'percent'
         ? (totalPrice * Number(selectedCoupon.discount_value)) / 100
         : Number(selectedCoupon.discount_value || 0)
   })()
   const normalizedPoints = Math.max(0, Math.min(pointsToRedeem || 0, typeof pointsBalance === 'number' ? pointsBalance : 0))
   const pointsDiscount = Math.min((normalizedPoints * 0.01), Math.max(totalPrice - couponDiscount, 0))
   const estimatedTotal = Math.max(totalPrice - couponDiscount - pointsDiscount, 0)

   // Redirect to home page if user is not authenticated
   useEffect(() => {
      if (!isAuthenticated) {
         router.push('/')
      }
   }, [isAuthenticated, router])

   // Load points balance
   useEffect(() => {
      async function loadPoints() {
         if (!isAuthenticated) return
         try {
            const res = await fetch('/api/users/points', {
               headers: {
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
               },
            })
            if (!res.ok) return
            const data = await res.json()
            setPointsBalance(Number(data?.balance || 0))
         } catch (_) { }
      }
      loadPoints()
   }, [isAuthenticated, token])

   // Load coupons explicitly so you can see the request in Network tab
   useEffect(() => {
      async function loadCoupons() {
         if (!isAuthenticated) return
         try {
            const res = await fetch('/api/users/coupons?onlyAvailable=1', {
               headers: {
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
               },
            })
            if (!res.ok) return
            const data = await res.json()
            setCoupons(Array.isArray(data) ? data : [])
         } catch (_) { }
      }
      loadCoupons()
   }, [isAuthenticated, token])

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
               couponCode: couponCode || undefined,
               pointsToRedeem: pointsToRedeem > 0 ? pointsToRedeem : 0,
            })
         })
         if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || 'Failed to place order')
         }
         const data = await res.json()
         showToast.success('Order placed successfully')
         if (data?.discounts) {
            const { coupon = 0, points = 0 } = data.discounts
            if (coupon || points) {
               showToast.info(`Discounts applied - Coupon: $${Number(coupon).toFixed(2)}, Points: $${Number(points).toFixed(2)}`)
            }
         }
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
                           <label className="block text-sm text-white/80">Coupon</label>
                           <div className="flex gap-2">
                              <select
                                 value={couponCode}
                                 onChange={(e) => setCouponCode(e.target.value)}
                                 className="flex-1 rounded-lg bg-white/10 border border-white/20 p-2 text-white"
                              >
                                 <option value="">-- No coupon --</option>
                                 {(coupons || []).map((c: any) => (
                                    <option key={c.code} value={c.code}>
                                       {c.code} ({c.discount_type === 'percent' ? `${c.discount_value}%` : `$${Number(c.discount_value).toFixed(2)}`})
                                    </option>
                                 ))}
                              </select>
                              {couponCode && (
                                 <button type="button" onClick={() => setCouponCode('')} className="rounded px-3 py-2 border border-white/20 bg-white/10">Clear</button>
                              )}
                           </div>
                           <p className="text-xs text-white/60">Only one coupon can be applied per order.</p>
                           {selectedCoupon && (
                              <div className="text-xs text-white/60 mt-1">
                                 {selectedCoupon.min_order_amount ? `Min order: $${Number(selectedCoupon.min_order_amount).toFixed(2)}. ` : ''}
                                 {selectedCoupon.expires_at ? `Expires: ${new Date(selectedCoupon.expires_at).toLocaleDateString()}` : 'No expiry'}
                              </div>
                           )}
                           <div>
                              <label className="block text-sm text-white/80">Redeem Points {typeof pointsBalance === 'number' ? `(Available: ${pointsBalance})` : ''}</label>
                              <input
                                 type="number"
                                 min={0}
                                 value={pointsToRedeem}
                                 onChange={(e) => setPointsToRedeem(Math.max(0, Math.min(Number(e.target.value) || 0, typeof pointsBalance === 'number' ? pointsBalance : 0)))}
                                 placeholder="0"
                                 className="w-full rounded-lg bg-white/10 border border-white/20 p-2 text-white"
                              />
                              <p className="text-xs text-white/60 mt-1">1 point = $0.01</p>
                           </div>
                        </div>
                        {/* Summary with discount preview */}
                        <div className="mt-4 space-y-2 text-sm">
                           <div className="flex items-center justify-between text-white/80"><span>Subtotal</span><span className="text-white">${totalPrice.toFixed(2)}</span></div>
                           <div className="flex items-center justify-between text-white/80"><span>Coupon discount</span><span className="text-green-300">-${couponDiscount.toFixed(2)}</span></div>
                           <div className="flex items-center justify-between text-white/80"><span>Points discount</span><span className="text-green-300">-${pointsDiscount.toFixed(2)}</span></div>
                           <div className="flex items-center justify-between font-semibold"><span>Estimated total</span><span>${estimatedTotal.toFixed(2)}</span></div>
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



