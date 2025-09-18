import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { 
  setCartItems, 
  setLoading, 
  setError,
  updateCartTotals 
} from '../store/slices/cartSlice'
import { showToast } from '../utils/toast'
import { useAuth } from './useAuth'

interface CartItem {
  id: number
  product_id: number
  quantity: number
  name: string
  price: number
  discount_price?: number | null
  sku: string
  stock_quantity: number
  image?: string | null
}

interface CartResponse {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

export const useCartAPI = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, token } = useAuth()
  const cart = useSelector((state: RootState) => state.cart)
  const inFlightRef = useRef(false)
  const controllerRef = useRef<AbortController | null>(null)
  const lastFetchAtRef = useRef<number>(0)

  // Load cart from API
  const loadCart = useCallback(async () => {
    if (!isAuthenticated || !token) return
    // Prevent spamming the API: skip if a fetch is in-flight or last fetch < 1s ago
    const now = Date.now()
    if (inFlightRef.current || now - lastFetchAtRef.current < 1000) return
    try {
      inFlightRef.current = true
      lastFetchAtRef.current = now
      dispatch(setLoading(true))
      // Cancel any previous request
      if (controllerRef.current) controllerRef.current.abort()
      controllerRef.current = new AbortController()
      const response = await fetch(`/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to load cart')
      }

      const data: CartResponse = await response.json()
      
      // Transform API data to match frontend format
      const transformedItems = data.items.map(item => ({
        id: item.product_id,
        name: item.name,
        price: Number(item.discount_price || item.price),
        image: item.image,
        quantity: item.quantity,
        stock: item.stock_quantity
      }))

      dispatch(setCartItems(transformedItems))
      dispatch(updateCartTotals({
        totalItems: data.totalItems,
        totalPrice: data.totalPrice
      }))
    } catch (error) {
      console.error('Error loading cart:', error)
      dispatch(setError('Failed to load cart'))
    } finally {
      dispatch(setLoading(false))
      inFlightRef.current = false
    }
  }, [dispatch, isAuthenticated, token])

  // Add item to cart via API
  const addItem = useCallback(async (product: {
    id: number
    name: string
    price: number
    image?: string | null
    stock: number
  }, quantity: number = 1) => {
    if (!isAuthenticated || !token) {
      showToast.error('Please login to add items to cart')
      return
    }

    try {
      const response = await fetch(`/api/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product.id,
          quantity
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add item to cart')
      }

      showToast.success(`${product.name} added to cart!`)
      // Reload cart to get updated data
      await loadCart()
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      showToast.error(error.message || 'Failed to add item to cart')
    }
  }, [dispatch, isAuthenticated, token, loadCart])

  // Update item quantity via API
  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    if (!isAuthenticated || !token) return

    try {
      // Find the cart item ID for this product
      const cartItem = cart.items.find(item => item.id === productId)
      if (!cartItem) {
        showToast.error('Item not found in cart')
        return
      }

      const response = await fetch(`/api/cart/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemId: cartItem.id, // This should be the cart item ID, not product ID
          quantity
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update cart')
      }

      if (quantity === 0) {
        showToast.info('Item removed from cart')
      } else {
        showToast.success('Cart updated')
      }
      
      // Reload cart to get updated data
      await loadCart()
    } catch (error: any) {
      console.error('Error updating cart:', error)
      showToast.error(error.message || 'Failed to update cart')
    }
  }, [dispatch, isAuthenticated, token, cart.items, loadCart])

  // Remove item from cart via API
  const removeItem = useCallback(async (productId: number) => {
    if (!isAuthenticated || !token) return

    try {
      // Find the cart item ID for this product
      const cartItem = cart.items.find(item => item.id === productId)
      if (!cartItem) {
        showToast.error('Item not found in cart')
        return
      }

      const response = await fetch(`/api/cart/remove/${cartItem.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to remove item')
      }

      showToast.info('Item removed from cart')
      // Reload cart to get updated data
      await loadCart()
    } catch (error: any) {
      console.error('Error removing from cart:', error)
      showToast.error(error.message || 'Failed to remove item')
    }
  }, [dispatch, isAuthenticated, token, cart.items, loadCart])

  // Clear entire cart via API
  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !token) return

    try {
      const response = await fetch(`/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to clear cart')
      }

      showToast.info('Cart cleared')
      // Reload cart to get updated data
      await loadCart()
    } catch (error: any) {
      console.error('Error clearing cart:', error)
      showToast.error(error.message || 'Failed to clear cart')
    }
  }, [dispatch, isAuthenticated, token, loadCart])

  // Load cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      loadCart()
    } else {
      // Clear cart when user logs out
      dispatch(setCartItems([]))
      dispatch(updateCartTotals({ totalItems: 0, totalPrice: 0 }))
    }
  }, [isAuthenticated, loadCart, dispatch])

  return {
    // State
    items: cart.items,
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice,
    isEmpty: cart.items.length === 0,
    isLoading: cart.isLoading,
    error: cart.error,
    
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    loadCart,
    
    // Helper functions
    formatPrice: (price: number) => new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price),
  }
}
