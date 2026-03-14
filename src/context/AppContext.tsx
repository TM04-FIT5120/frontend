import type { ReactNode } from 'react'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Language } from '@/i18n/translations'
import { translations } from '@/i18n/translations'

export type { Language }

export interface Settings {
  notifications: boolean
  darkMode:      boolean
  language:      Language
  units:         'metric' | 'imperial'
}

const DEFAULT_SETTINGS: Settings = {
  notifications: true,
  darkMode:      false,
  language:      'english',
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
  // ── Favourites ──────────────────────────────────────────────────────────────
  favoriteIds:    string[]
  toggleFavorite: (id: string) => void
  isFavorite:     (id: string) => boolean
  // ── Settings ────────────────────────────────────────────────────────────────
  settings:       Settings
  updateSettings: (patch: Partial<Settings>) => void
  // ── Translations ────────────────────────────────────────────────────────────
  t: (key: string) => string
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    readStorage<string[]>('myairsafe_favorites', [])
  )
  const [settings, setSettings] = useState<Settings>(() => ({
    ...DEFAULT_SETTINGS,
    ...readStorage<Partial<Settings>>('myairsafe_settings', {}),
  }))

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('myairsafe_favorites', JSON.stringify(favoriteIds))
  }, [favoriteIds])

  // Persist settings
  useEffect(() => {
    localStorage.setItem('myairsafe_settings', JSON.stringify(settings))
  }, [settings])

  // Apply / remove dark mode on <html>
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      settings.darkMode ? 'dark' : 'light',
    )
  }, [settings.darkMode])

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }, [])

  const isFavorite = useCallback(
    (id: string) => favoriteIds.includes(id),
    [favoriteIds],
  )

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }))
  }, [])

  const t = useCallback(
    (key: string): string =>
      translations[settings.language]?.[key]
      ?? translations.english[key]
      ?? key,
    [settings.language],
  )

  return (
    <AppContext.Provider
      value={{ favoriteIds, toggleFavorite, isFavorite, settings, updateSettings, t }}
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
