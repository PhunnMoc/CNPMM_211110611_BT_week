"use client"

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { SmartImage } from '@/components/SmartImage'
import { ImageOff, Minus, Plus, Star } from 'lucide-react'
import { useCartAPI } from '@/hooks/useCartAPI'
import { useGetReviewsQuery, useCreateReviewMutation, useRecordProductViewMutation, useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery } from '@/store/api/api'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner, LoadingButton } from '@/components/LoadingSpinner'

interface ProductDetailApi {
   id: number
   name: string
   description: string
   price: number | string
   discount_price?: number | string | null
   category_id: number
   category_name?: string
   stock_quantity?: number
   images: { id: number; image_url: string; alt_text?: string; is_primary: number; sort_order: number }[]
}

export default function ProductDetailPage() {
   const { id } = useParams()
   const router = useRouter()
   const [data, setData] = useState<ProductDetailApi | null>(null)
   const [loading, setLoading] = useState(true)
   const [active, setActive] = useState(0)
   const [qty, setQty] = useState(1)
   const { addItem } = useCartAPI()
   const { isAuthenticated } = useAuth()
   const [addingToCart, setAddingToCart] = useState(false)

   const productIdNum = Number(id)
   const { data: reviewData, refetch: refetchReviews, isLoading: loadingReviews } = useGetReviewsQuery(
      { productId: Number(id), page: 1, limit: 5 },
      { skip: !id }
   )
   const [createReview, { isLoading: creatingReview }] = useCreateReviewMutation()
   const [newRating, setNewRating] = useState(5)
   const [newTitle, setNewTitle] = useState('')
   const [newComment, setNewComment] = useState('')
   const [recordView] = useRecordProductViewMutation()
   const { data: wishlist } = useGetWishlistQuery(undefined, { skip: !isAuthenticated })
   const [addToWishlist] = useAddToWishlistMutation()
   const [removeFromWishlist] = useRemoveFromWishlistMutation()
   type WishlistItem = { product_id: number }
   const isInWishlist = useMemo(() => !!(wishlist as WishlistItem[] | undefined)?.some?.((w) => w.product_id === productIdNum), [wishlist, productIdNum])

   useEffect(() => {
      if (!id) return
      const controller = new AbortController()
      async function load() {
         try {
            setLoading(true)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, { signal: controller.signal })
            if (!res.ok) throw new Error('Failed to load product')
            const json = await res.json()
            setData(json)
            // Record view (fire and forget)
            try { await recordView(Number(id)).unwrap() } catch { }
         } catch (e) {
            if (e instanceof DOMException && e.name === 'AbortError') {
               // ignore abort on unmount/navigation
            } else {
               console.error(e)
            }
         } finally {
            setLoading(false)
         }
      }
      load()
      return () => controller.abort()
   }, [id, recordView])

   const price = useMemo(() => Number(data?.discount_price ?? data?.price ?? 0), [data])

   async function addToCart() {
      if (!data) return
      try {
         setAddingToCart(true)
         await addItem({
            id: data.id,
            name: data.name,
            price,
            image: data.images?.[0]?.image_url || null,
            stock: data.stock_quantity || 100
         }, qty)
      } finally {
         setAddingToCart(false)
      }
   }

   async function submitReview(e: React.FormEvent) {
      e.preventDefault()
      if (!isAuthenticated) {
         router.push('/auth/signin')
         return
      }
      try {
         await createReview({ productId: productIdNum, rating: newRating, title: newTitle || undefined, comment: newComment || undefined }).unwrap()
         setNewTitle('')
         setNewComment('')
         setNewRating(5)
         await refetchReviews()
         alert('Review submitted! You may have received points and a coupon.')
      } catch (err: unknown) {
         const message = (err as { data?: { message?: string } })?.data?.message || 'Failed to submit review'
         alert(message)
      }
   }

   return (
      <div className="min-h-screen bg-cosmic">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
            <div className="flex items-center justify-between mb-6">
               <Link href="/products" className="btn-primary rounded-full">Back to products</Link>
               <Link href="/" className="btn-primary rounded-full">Home</Link>
            </div>

            {loading || !data ? (
               <div className="glass-card p-8">
                  <LoadingSpinner text="Loading product..." size="lg" />
               </div>
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                     <div className="glass-card overflow-hidden">
                        <div className="relative h-96">
                           {data.images?.[active]?.image_url ? (
                              <SmartImage src={data.images[active].image_url} alt={data.images[active].alt_text || data.name} fill className="object-cover" sizes="100vw" />
                           ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                 <ImageOff className="h-8 w-8 text-gray-400" />
                              </div>
                           )}
                        </div>
                     </div>
                     {data.images?.length ? (
                        <div className="grid grid-cols-4 gap-2 mt-3">
                           {data.images.map((img, i) => (
                              <button key={img.id} onClick={() => setActive(i)} className={`relative h-20 rounded overflow-hidden border ${i === active ? 'border-primary-600' : 'border-white/20'}`}>
                                 {img.image_url ? (
                                    <SmartImage src={img.image_url} alt={img.alt_text || data.name} fill className="object-cover" sizes="25vw" />
                                 ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                       <ImageOff className="h-6 w-6 text-gray-400" />
                                    </div>
                                 )}
                              </button>
                           ))}
                        </div>
                     ) : null}
                  </div>
                  <div>
                     <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
                     <p className="text-white/80 mb-4">{data.description}</p>
                     <div className="mb-3 text-white/80 text-sm">
                        <span className="mr-4">Viewed: <span className="text-white">{(data as unknown as { view_count?: number }).view_count ?? 0}</span></span>
                        <span className="mr-4">Customers bought: <span className="text-white">{(data as unknown as { purchase_count?: number }).purchase_count ?? 0}</span></span>

                     </div>
                     <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl font-bold">${price.toFixed(2)}</span>
                        {data.discount_price && (
                           <span className="text-white/60 line-through">${Number(data.price).toFixed(2)}</span>
                        )}
                     </div>

                     <div className="flex items-center gap-4 mb-2">
                        <div className="inline-flex items-center bg-white/10 border border-white/20 rounded-full">
                           <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2"><Minus className="h-4 w-4" /></button>
                           <span className="px-4">{qty}</span>
                           <button onClick={() => setQty((q) => q + 1)} className="p-2"><Plus className="h-4 w-4" /></button>
                        </div>
                        <LoadingButton
                           onClick={addToCart}
                           className="btn-primary rounded-full"
                           isLoading={addingToCart}
                        >
                           Add to cart
                        </LoadingButton>
                        <button
                           onClick={async () => {
                              try {
                                 if (isInWishlist) await removeFromWishlist({ productId: productIdNum }).unwrap()
                                 else await addToWishlist({ productId: productIdNum }).unwrap()
                              } catch { }
                           }}
                           className={`ml-3 rounded-full border px-4 py-2 ${isInWishlist ? 'border-red-500 text-red-400' : 'border-white/30 text-white/80'}`}
                        >
                           {isInWishlist ? 'Remove Wishlist' : 'Add to Wishlist'}
                        </button>
                     </div>
                     {typeof data.stock_quantity === 'number' && (
                        <div className="mb-6 text-white/80">In stock: <span className="text-white">{data.stock_quantity}</span></div>
                     )}

                     {data.category_name && (
                        <div className="text-white/80">Category: <span className="text-white">{data.category_name}</span></div>
                     )}
                  </div>
               </div>
            )}

            {/* Reviews Section */}
            {!loading && data && (
               <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Move form ABOVE list */}
                  <div className="glass-card p-6 order-1">
                     <h2 className="text-2xl font-semibold mb-4">Write a Review</h2>
                     {isAuthenticated ? (
                        <form onSubmit={submitReview} className="space-y-4">
                           <div>
                              <label className="block mb-2">Rating</label>
                              <div className="flex items-center gap-2">
                                 {[1, 2, 3, 4, 5].map(v => (
                                    <button
                                       type="button"
                                       key={v}
                                       onClick={() => setNewRating(v)}
                                       className="p-1"
                                       aria-label={`${v} star`}
                                    >
                                       <Star className={`${v <= newRating ? 'text-yellow-400 fill-yellow-400' : 'text-white/40 fill-transparent'} h-7 w-7 transition-colors`} />
                                    </button>
                                 ))}
                                 <span className="ml-2 text-white/70">{newRating} / 5</span>
                              </div>
                           </div>
                           <div>
                              <label className="block mb-1">Title (optional)</label>
                              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-transparent border border-white/20 rounded p-2" />
                           </div>
                           <div>
                              <label className="block mb-1">Comment (optional)</label>
                              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full bg-transparent border border-white/20 rounded p-2" rows={4} />
                           </div>
                           <button disabled={creatingReview} className="btn-primary rounded-full">
                              {creatingReview ? 'Submitting...' : 'Submit Review'}
                           </button>
                        </form>
                     ) : (
                        <div>
                           <p className="text-white/80 mb-3">Please sign in to write a review.</p>
                           <Link href="/auth/signin" className="btn-primary rounded-full">Sign in</Link>
                        </div>
                     )}
                  </div>

                  <div className="glass-card p-6 order-2">
                     <div className="flex items-center mb-4">
                        <h2 className="text-2xl font-semibold">Customer Reviews</h2>
                        <span className="text-white">({(data as unknown as { review_count?: number }).review_count ?? 0})</span>
                     </div>
                     {loadingReviews ? (
                        <div className="text-white/80">Loading reviews...</div>
                     ) : (
                        <div className="space-y-4">
                           {reviewData?.reviews?.length ? reviewData.reviews.map((r) => (
                              <div key={r.id} className="border border-white/10 rounded-lg p-4">
                                 <div className="flex items-center justify-between">
                                    <div className="font-semibold">{r.first_name || ''} {r.last_name || ''}</div>
                                    <div className="flex items-center gap-1">
                                       {[1, 2, 3, 4, 5].map(v => (
                                          <Star key={v} className={`${v <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/25 fill-transparent'} h-5 w-5`} />
                                       ))}
                                    </div>
                                 </div>
                                 {r.title ? <div className="mt-1 font-medium">{r.title}</div> : null}
                                 {r.comment ? <div className="mt-1 text-white/80">{r.comment}</div> : null}
                                 {r.is_verified_purchase ? <div className="mt-2 text-xs text-green-400">Verified purchase</div> : null}
                              </div>
                           )) : <div className="text-white/70">No reviews yet.</div>}
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
   )
}


