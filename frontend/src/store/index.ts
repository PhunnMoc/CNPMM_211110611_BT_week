import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { persistStore, persistReducer, createTransform } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

// Import slices
import authReducer from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import uiReducer from './slices/uiSlice'
import webSocketReducer from './slices/webSocketSlice'
import notificationsReducer from './slices/notificationsSlice'

// Import API services
import { api } from './api/api'

// Persist config for auth and cart
// Prevent huge base64 avatar strings from filling localStorage by stripping avatarUrl on persist
const stripLargeAvatar = createTransform(
  (inboundState: any) => {
    if (!inboundState) return inboundState
    if (inboundState.user) {
      const { user, ...rest } = inboundState
      const safeUser = { ...user, avatarUrl: null }
      return { ...rest, user: safeUser }
    }
    return inboundState
  },
  (outboundState: any) => outboundState,
  { whitelist: ['auth'] }
)

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart'],
  transforms: [stripLargeAvatar],
}

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  ui: uiReducer,
  webSocket: webSocketReducer,
  notifications: notificationsReducer,
  [api.reducerPath]: api.reducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'webSocket/setSocket', // Ignore WebSocket actions that might contain non-serializable data
        ],
        ignoredPaths: ['webSocket.socket'], // Ignore socket in state if it exists
      },
    }).concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)

// Setup listeners for RTK Query
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector