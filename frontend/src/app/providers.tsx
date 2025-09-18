'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '../store'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
   const [queryClient] = useState(() => new QueryClient({
      defaultOptions: {
         queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
         },
      },
   }))

   return (
      <Provider store={store}>
         <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
            <QueryClientProvider client={queryClient}>
               {children}
            </QueryClientProvider>
         </PersistGate>
      </Provider>
   )
}
