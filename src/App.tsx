import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SplashScreen } from '@/components/SplashScreen'
import { AppRoutes } from '@/routes/AppRoutes'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
})

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}