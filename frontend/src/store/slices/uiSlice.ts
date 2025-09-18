import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

interface Modal {
  id: string
  type: string
  isOpen: boolean
  data?: unknown
}

interface UIState {
  isLoading: boolean
  loadingMessage?: string
  toasts: Toast[]
  modals: Modal[]
  sidebarOpen: boolean
  searchQuery: string
  filters: {
    category?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: 'name' | 'price' | 'created_at' | 'rating'
    sortOrder?: 'asc' | 'desc'
  }
}

const initialState: UIState = {
  isLoading: false,
  loadingMessage: undefined,
  toasts: [],
  modals: [],
  sidebarOpen: false,
  searchQuery: '',
  filters: {
    sortBy: 'created_at',
    sortOrder: 'desc',
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.isLoading = action.payload.isLoading
      state.loadingMessage = action.payload.message
    },
    
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const toast: Toast = {
        id: Date.now().toString(),
        ...action.payload,
      }
      state.toasts.push(toast)
    },
    
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload)
    },
    
    clearToasts: (state) => {
      state.toasts = []
    },
    
    openModal: (state, action: PayloadAction<{ type: string; data?: unknown }>) => {
      const existingModal = state.modals.find(modal => modal.type === action.payload.type)
      if (existingModal) {
        existingModal.isOpen = true
        existingModal.data = action.payload.data
      } else {
        state.modals.push({
          id: Date.now().toString(),
          type: action.payload.type,
          isOpen: true,
          data: action.payload.data,
        })
      }
    },
    
    closeModal: (state, action: PayloadAction<string>) => {
      const modal = state.modals.find(modal => modal.type === action.payload)
      if (modal) {
        modal.isOpen = false
      }
    },
    
    closeAllModals: (state) => {
      state.modals.forEach(modal => {
        modal.isOpen = false
      })
    },
    
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    
    setFilters: (state, action: PayloadAction<Partial<UIState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    
    clearFilters: (state) => {
      state.filters = {
        sortBy: 'created_at',
        sortOrder: 'desc',
      }
    },
  },
})

export const {
  setLoading,
  addToast,
  removeToast,
  clearToasts,
  openModal,
  closeModal,
  closeAllModals,
  toggleSidebar,
  setSidebarOpen,
  setSearchQuery,
  setFilters,
  clearFilters,
} = uiSlice.actions

export default uiSlice.reducer

// Selectors
export const selectUI = (state: { ui: UIState }) => state.ui
export const selectIsLoading = (state: { ui: UIState }) => state.ui.isLoading
export const selectLoadingMessage = (state: { ui: UIState }) => state.ui.loadingMessage
export const selectToasts = (state: { ui: UIState }) => state.ui.toasts
export const selectModals = (state: { ui: UIState }) => state.ui.modals
export const selectModalByType = (type: string) => (state: { ui: UIState }) =>
  state.ui.modals.find(modal => modal.type === type)
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen
export const selectSearchQuery = (state: { ui: UIState }) => state.ui.searchQuery
export const selectFilters = (state: { ui: UIState }) => state.ui.filters
