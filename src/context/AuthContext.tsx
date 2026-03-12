import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'

export interface AuthUser {
  id: string
  displayName?: string
}

interface AuthContextValue {
  user: AuthUser | null
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const login = async () => {
    // Placeholder: will be replaced with Firebase Auth implementation later.
    setUser({ id: 'demo-user', displayName: 'Demo User' })
  }

  const logout = async () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

