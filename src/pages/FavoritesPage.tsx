import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Trash2, ArrowRight, BookmarkPlus, Loader2, AlertCircle } from 'lucide-react'
import { getAQIMeta, aqiPercent } from '@/utils/aqiHelpers'
import { useAppContext } from '@/context/AppContext'
import { strings } from '@/strings'
import { fetchAirQualityByCoords, airQualityToLocation } from '@/api/api'
import type { FavoriteItem } from '@/api/api'
import type { Location } from '@/data/locations'

// ── Types ─────────────────────────────────────────────────────────────────────

interface FavEntry {
  item:     FavoriteItem
  location: Location | null
  loading:  boolean
  error:    boolean
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function FavoritesPage() {
  const navigate = useNavigate()
  const { favorites, favoritesLoaded, removeFromFavorites } = useAppContext()

  const [entries,  setEntries]  = useState<FavEntry[]>([])
  const [removing, setRemoving] = useState<number | null>(null)

  // Whenever the context favorites list changes, sync entries and fetch AQI
  useEffect(() => {
    if (!favoritesLoaded) return

    setEntries(prev => {
      // Keep existing AQI data for items already loaded; add new items as loading
      const next: FavEntry[] = favorites.map(item => {
        const existing = prev.find(e => e.item.id === item.id)
        if (existing) return existing
        return { item, location: null, loading: true, error: false }
      })
      return next
    })

    // Fetch AQI only for newly added items (those without location data)
    favorites.forEach(item => {
      setEntries(prev => {
        const entry = prev.find(e => e.item.id === item.id)
        if (!entry || !entry.loading) return prev // already loaded or doesn't exist
        return prev // kick off fetch below
      })

      fetchAirQualityByCoords(item.latitude, item.longitude)
        .then(apiData => {
          const location = airQualityToLocation(apiData)
          location.name = item.cityName
          setEntries(prev =>
            prev.map(e => e.item.id === item.id ? { ...e, location, loading: false } : e)
          )
        })
        .catch(() => {
          setEntries(prev =>
            prev.map(e => e.item.id === item.id ? { ...e, loading: false, error: true } : e)
          )
        })
    })
  }, [favorites, favoritesLoaded])

  const handleRemove = (entry: FavEntry) => {
    setRemoving(entry.item.id)
    setTimeout(() => {
      removeFromFavorites(entry.item.id) // calls deleteFavorite API + updates context
      setRemoving(null)
    }, 350)
  }

  const count = favorites.length

  // ── Loading state ───────────────────────────────────────────────────────────
  if (!favoritesLoaded) {
    return (
      <div className="mx-auto animate-fade-in" style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: '2rem' }}>
          <p className="label-sm" style={{ marginBottom: 10 }}>{strings['fav_subtitle']}</p>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 800, margin: 0, color: '#1a2332', letterSpacing: '-0.02em' }}>
            {strings['fav_title']}
          </h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ height: 18, borderRadius: 8, background: '#f1f5f9', width: '40%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ height: 12, borderRadius: 8, background: '#f1f5f9', width: '65%', animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
              <Loader2 size={20} color="#94a3b8" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto animate-fade-in" style={{ maxWidth: 720 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="label-sm" style={{ marginBottom: 10 }}>{strings['fav_subtitle']}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 800, margin: 0, color: '#1a2332', letterSpacing: '-0.02em' }}>
              {strings['fav_title']}
            </h1>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: '#8a96a8', margin: 0, fontWeight: 500 }}>
            {count} {count === 1 ? strings['fav_saved_one'] : strings['fav_saved_many']}
          </p>
        </div>
        <button onClick={() => navigate('/search')} className="btn btn-primary">
          <BookmarkPlus size={16} />{strings['fav_add']}
        </button>
      </div>

      {/* List */}
      {entries.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {entries.map((entry, i) => {
            const { item, location, loading: entryLoading, error: entryError } = entry
            const isRemoving = removing === item.id

            // AQI still loading
            if (entryLoading) {
              return (
                <div key={item.id} className="card" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', gap: 16, opacity: isRemoving ? 0 : 1, transition: 'opacity 0.35s ease' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1a2332' }}>{item.cityName}</div>
                    <div style={{ height: 10, borderRadius: 8, background: '#f1f5f9', width: '55%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </div>
                  <Loader2 size={18} color="#94a3b8" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                </div>
              )
            }

            // AQI fetch failed
            if (entryError || !location) {
              return (
                <div key={item.id} className="card" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', gap: 16, opacity: isRemoving ? 0 : 1, transition: 'opacity 0.35s ease' }}>
                  <AlertCircle size={18} color="#ea580c" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1a2332' }}>{item.cityName}</div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#8a96a8', marginTop: 2 }}>Could not fetch air quality data</div>
                  </div>
                  <button onClick={() => handleRemove(entry)} className="btn btn-danger" style={{ flexShrink: 0, padding: '0.5rem' }} aria-label="Remove from favourites">
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            }

            const meta = getAQIMeta(location.status)

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  overflow:   'hidden',
                  opacity:    isRemoving ? 0 : 1,
                  transform:  isRemoving ? 'translateX(-16px) scale(0.98)' : 'none',
                  transition: 'opacity 0.35s ease, transform 0.35s ease',
                  animation:  `fadeUp 0.5s ease-out ${i * 70}ms both`,
                  position:   'relative',
                }}
              >
                {/* Left colour accent */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: meta.color }} />

                <div style={{ padding: '1.5rem 1.5rem 1.5rem 1.75rem', display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                  {/* Main content */}
                  <div
                    onClick={() => navigate(`/location/${encodeURIComponent(location.name)}`)}
                    style={{ flex: 1, cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: '#1a2332', margin: 0 }}>
                        {location.name}
                      </h3>
                      <span className={`aqi-chip ${meta.chipClass}`}>
                        {strings[location.status === 'very-unhealthy' ? 'status_very_unhealthy' : 'status_' + location.status]}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.8rem', fontWeight: 800, color: meta.color, lineHeight: 1 }}>
                        {Math.round(location.aqi)}
                      </span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#8a96a8', fontWeight: 500 }}>AQI</span>
                    </div>

                    <div style={{ height: 4, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden', maxWidth: 260, marginBottom: 12 }}>
                      <div style={{ height: '100%', width: `${aqiPercent(location.aqi)}%`, background: meta.color, borderRadius: 999 }} />
                    </div>

                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#4a5568', margin: '0 0 10px', lineHeight: 1.55 }}>
                      {location.description}
                    </p>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: meta.bgColor, border: `1px solid ${meta.borderColor}`, borderRadius: 10, padding: '0.35rem 0.8rem', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: meta.color, fontWeight: 600 }}>
                      {meta.elderNote}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, color: '#1d4ed8', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600 }}>
                      View details <ArrowRight size={13} />
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(entry)}
                    className="btn btn-danger"
                    style={{ flexShrink: 0, padding: '0.5rem' }}
                    aria-label="Remove from favourites"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 24, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={32} color="#fca5a5" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: '#1a2332', margin: '0 0 8px' }}>
              {strings['fav_empty_title']}
            </h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#8a96a8', margin: 0, maxWidth: 300 }}>
              {strings['fav_empty_desc']}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
