import type { ReactNode } from 'react'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Location } from '@/data/locations'
import { locations as staticLocations } from '@/data/locations'
import { fetchAllFavorites, addFavorite, deleteFavorite } from '@/api/api'

export interface Settings {
  notifications: boolean
  units:         'metric' | 'imperial'
}

const DEFAULT_SETTINGS: Settings = {
  notifications: true,
  units:         'metric',
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

interface AppContextValue {
  favoriteIds:    string[]
  toggleFavorite: (location: Location) => void
  isFavorite:     (id: string) => boolean
  settings:       Settings
  updateSettings: (patch: Partial<Settings>) => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  // favoriteIds holds static location IDs (e.g. '1', '2')
  const [favoriteIds, setFavoriteIds]       = useState<string[]>([])
  // backendFavMap maps static location ID → backend numeric ID (needed for DELETE)
  const [backendFavMap, setBackendFavMap]   = useState<Record<string, number>>({})

  const [settings, setSettings] = useState<Settings>(() => ({
    ...DEFAULT_SETTINGS,
    ...readStorage<Partial<Settings>>('myairsafe_settings', {}),
  }))

  // Load favourites from API on mount; fall back to localStorage if API is unreachable
  useEffect(() => {
    fetchAllFavorites()
      .then(items => {
        const ids: string[] = []
        const map: Record<string, number> = {}
        items.forEach(item => {
          const match = staticLocations.find(
            l => l.name.toLowerCase() === item.cityName.toLowerCase()
          )
          if (match) {
            ids.push(match.id)
            map[match.id] = item.id
          }
        })
        setFavoriteIds(ids)
        setBackendFavMap(map)
      })
      .catch(() => {
        // API unreachable — fall back to what was saved locally
        setFavoriteIds(readStorage<string[]>('myairsafe_favorites', []))
      })
  }, [])

  // Persist settings
  useEffect(() => {
    localStorage.setItem('myairsafe_settings', JSON.stringify(settings))
  }, [settings])

  const toggleFavorite = useCallback((location: Location) => {
    const id = location.id
    if (favoriteIds.includes(id)) {
      // Remove
      const backendId = backendFavMap[id]
      if (backendId != null) {
        deleteFavorite(backendId).catch(() => {/* silently ignore */})
      }
      setFavoriteIds(prev => prev.filter(i => i !== id))
      setBackendFavMap(prev => { const n = { ...prev }; delete n[id]; return n })
    } else {
      // Add
      addFavorite(location.name, location.lat, location.lng)
        .then(item => {
          setBackendFavMap(prev => ({ ...prev, [id]: item.id }))
        })
        .catch(() => {/* silently ignore */})
      setFavoriteIds(prev => [...prev, id])
    }
  }, [favoriteIds, backendFavMap])

  const isFavorite = useCallback(
    (id: string) => favoriteIds.includes(id),
    [favoriteIds],
  )

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }))
  }, [])

  return (
    <AppContext.Provider
      value={{ favoriteIds, toggleFavorite, isFavorite, settings, updateSettings }}
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
