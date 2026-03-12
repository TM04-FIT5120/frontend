import { Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/components/Layout/RootLayout'
import { HomePage } from '@/pages/HomePage'
import { SearchPage } from '@/pages/SearchPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { CompareLocationsPage } from '@/pages/CompareLocationsPage'
import { LocationDetailPage } from '@/pages/LocationDetailPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="compare" element={<CompareLocationsPage />} />
        <Route path="location/:cityName" element={<LocationDetailPage />} />
      </Route>
    </Routes>
  )
}

