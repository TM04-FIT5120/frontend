import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'

export type PreferredLocation = {
  name: string
}

interface AppContextValue {
  preferredLocation: PreferredLocation | null
  setPreferredLocation: (location: PreferredLocation | null) => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [preferredLocation, setPreferredLocation] = useState<PreferredLocation | null>(null)

  return (
    <AppContext.Provider
      value={{
        preferredLocation,
        setPreferredLocation,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return ctx
}

