import type { ReactNode } from 'react'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Location } from '@/data/locations'
import { fetchAllFavorites, addFavorite, deleteFavorite } from '@/api/api'
import type { FavoriteItem } from '@/api/api'

// ── Settings ──────────────────────────────────────────────────────────────────

export interface Settings {
  notifications: boolean
}

const DEFAULT_SETTINGS: Settings = { notifications: true }

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

// ── Context shape ─────────────────────────────────────────────────────────────

interface AppContextValue {
  favorites:           FavoriteItem[]
  favoritesLoaded:     boolean
  isFavorite:          (cityName: string) => boolean
  toggleFavorite:      (location: Location) => void
  removeFromFavorites: (id: number) => void
  settings:            Settings
  updateSettings:      (patch: Partial<Settings>) => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

// ── Provider ──────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites,       setFavorites]       = useState<FavoriteItem[]>([])
  const [favoritesLoaded, setFavoritesLoaded] = useState(false)

  const [settings, setSettings] = useState<Settings>(() => ({
    ...DEFAULT_SETTINGS,
    ...readStorage<Partial<Settings>>('myairsafe_settings', {}),
  }))

  // Load all favourites from backend on mount
  useEffect(() => {
    fetchAllFavorites()
      .then(items => {
        setFavorites(items)
        setFavoritesLoaded(true)
      })
      .catch(() => {
        setFavoritesLoaded(true) // mark as done even on error
      })
  }, [])

  // Persist settings only
  useEffect(() => {
    localStorage.setItem('myairsafe_settings', JSON.stringify(settings))
  }, [settings])

  const isFavorite = useCallback(
    (cityName: string) =>
      favorites.some(f => f.cityName.toLowerCase() === cityName.toLowerCase()),
    [favorites],
  )

  const toggleFavorite = useCallback((location: Location) => {
    const existing = favorites.find(
      f => f.cityName.toLowerCase() === location.name.toLowerCase()
    )
    if (existing) {
      // Already a favourite, optimistically remove, then call API
      setFavorites(prev => prev.filter(f => f.id !== existing.id))
      deleteFavorite(existing.id).catch(() => {
        // Revert if API call fails
        setFavorites(prev => [...prev, existing])
      })
    } else {
      // Not a favourite, optimistically add a temp item so the heart turns red immediately
      const tempId: number = -Date.now()
      const tempItem: FavoriteItem = {
        id:        tempId,
        cityName:  location.name,
        latitude:  location.lat,
        longitude: location.lng,
        createdAt: new Date().toISOString(),
      }
      setFavorites(prev => [...prev, tempItem])
      addFavorite(location.name, location.lat, location.lng)
        .then(item => {
          // Swap temp item with the real backend item (gives us the real id for deletion)
          setFavorites(prev => prev.map(f => f.id === tempId ? item : f))
        })
        .catch(() => {
          // Re-sync from backend: the item may have been saved even if the response failed to parse.
          // This avoids incorrectly reverting a successful add.
          fetchAllFavorites()
            .then(items => setFavorites(items))
            .catch(() => {
              // Only revert if the backend is truly unreachable
              setFavorites(prev => prev.filter(f => f.id !== tempId))
            })
        })
    }
  }, [favorites])

  const removeFromFavorites = useCallback((id: number) => {
    deleteFavorite(id).catch(() => {})
    setFavorites(prev => prev.filter(f => f.id !== id))
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }))
  }, [])

  return (
    <AppContext.Provider
      value={{ favorites, favoritesLoaded, isFavorite, toggleFavorite, removeFromFavorites, settings, updateSettings }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
