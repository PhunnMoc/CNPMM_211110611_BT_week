import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CartItem {
  id: number
  name: string
  price: number
  image?: string | null
  quantity: number
  stock: number
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isLoading: boolean
  error: string | null
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        // Check stock limit
        const newQuantity = existingItem.quantity + 1
        if (newQuantity <= action.payload.stock) {
          existingItem.quantity = newQuantity
        }
      } else {
        // Add new item with quantity 1
        state.items.push({ ...action.payload, quantity: 1 })
      }
      
      // Recalculate totals
      cartSlice.caseReducers.calculateTotals(state)
    },
    
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      cartSlice.caseReducers.calculateTotals(state)
    },
    
    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id)
      if (item) {
        const newQuantity = Math.max(0, Math.min(action.payload.quantity, item.stock))
        if (newQuantity === 0) {
          state.items = state.items.filter(cartItem => cartItem.id !== action.payload.id)
        } else {
          item.quantity = newQuantity
        }
        cartSlice.caseReducers.calculateTotals(state)
      }
    },
    
    incrementQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find(item => item.id === action.payload)
      if (item && item.quantity < item.stock) {
        item.quantity += 1
        cartSlice.caseReducers.calculateTotals(state)
      }
    },
    
    decrementQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find(item => item.id === action.payload)
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1
        } else {
          state.items = state.items.filter(cartItem => cartItem.id !== action.payload)
        }
        cartSlice.caseReducers.calculateTotals(state)
      }
    },
    
    clearCart: (state) => {
      state.items = []
      state.totalItems = 0
      state.totalPrice = 0
    },
    
    calculateTotals: (state) => {
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
      state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    },
    
    updateStock: (state, action: PayloadAction<{ id: number; stock: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id)
      if (item) {
        item.stock = action.payload.stock
        // Adjust quantity if it exceeds new stock
        if (item.quantity > item.stock) {
          item.quantity = item.stock
        }
        cartSlice.caseReducers.calculateTotals(state)
      }
    },
    
    // API-based cart management
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload
      cartSlice.caseReducers.calculateTotals(state)
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    updateCartTotals: (state, action: PayloadAction<{ totalItems: number; totalPrice: number }>) => {
      state.totalItems = action.payload.totalItems
      state.totalPrice = action.payload.totalPrice
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  updateStock,
  setCartItems,
  setLoading,
  setError,
  updateCartTotals,
} = cartSlice.actions

export default cartSlice.reducer

// Selectors
export const selectCart = (state: { cart: CartState }) => state.cart
export const selectCartItems = (state: { cart: CartState }) => state.cart.items
export const selectCartTotalItems = (state: { cart: CartState }) => state.cart.totalItems
export const selectCartTotalPrice = (state: { cart: CartState }) => state.cart.totalPrice
export const selectCartItemById = (id: number) => (state: { cart: CartState }) => 
  state.cart.items.find(item => item.id === id)
export const selectCartItemCount = (state: { cart: CartState }) => state.cart.items.length
