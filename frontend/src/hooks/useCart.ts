import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  updateStock,
} from '../store/slices/cartSlice'
import { showToast } from '../utils/toast'

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>()
  const cart = useSelector((state: RootState) => state.cart)!

  const addItem = useCallback((product: {
    id: number
    name: string
    price: number
    image?: string | null
    stock: number
  }) => {
    dispatch(addToCart(product))
    showToast.success(`${product.name} added to cart!`)
  }, [dispatch])

  const removeItem = useCallback((productId: number) => {
    const item = cart.items.find(item => item.id === productId)
    if (item) {
      dispatch(removeFromCart(productId))
      showToast.info(`${item.name} removed from cart`)
    }
  }, [dispatch, cart.items])

  const updateItemQuantity = useCallback((productId: number, quantity: number) => {
    dispatch(updateQuantity({ id: productId, quantity }))
  }, [dispatch])

  const incrementItemQuantity = useCallback((productId: number) => {
    dispatch(incrementQuantity(productId))
  }, [dispatch])

  const decrementItemQuantity = useCallback((productId: number) => {
    dispatch(decrementQuantity(productId))
  }, [dispatch])

  const clearAllItems = useCallback(() => {
    dispatch(clearCart())
    showToast.info('Cart cleared')
  }, [dispatch])

  const updateItemStock = useCallback((productId: number, stock: number) => {
    dispatch(updateStock({ id: productId, stock }))
  }, [dispatch])

  const getItemQuantity = useCallback((productId: number) => {
    const item = cart.items.find(item => item.id === productId)
    return item?.quantity || 0
  }, [cart.items])

  const isInCart = useCallback((productId: number) => {
    return cart.items.some(item => item.id === productId)
  }, [cart.items])

  const canAddToCart = useCallback((productId: number, stock: number) => {
    const item = cart.items.find(item => item.id === productId)
    if (!item) return stock > 0
    return item.quantity < stock
  }, [cart.items])

  return {
    // State
    items: cart.items,
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice,
    isEmpty: cart.items.length === 0,
    
    // Actions
    addItem,
    removeItem,
    updateQuantity: updateItemQuantity,
    incrementQuantity: incrementItemQuantity,
    decrementQuantity: decrementItemQuantity,
    clearCart: clearAllItems,
    updateStock: updateItemStock,
    
    // Computed
    getItemQuantity,
    isInCart,
    canAddToCart,
    
    // Helper functions
    formatPrice: (price: number) => new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price),
  }
}
