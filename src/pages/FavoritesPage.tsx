import { useNavigate } from 'react-router-dom'
import { Heart, Trash2, MapPin, ArrowRight, BookmarkPlus } from 'lucide-react'
import { getAQIMeta, aqiPercent } from '@/utils/aqiHelpers'
import { useLocations } from '@/hooks/useLocations'
import { useAppContext } from '@/context/AppContext'
import { useState } from 'react'

export function FavoritesPage() {
  const navigate = useNavigate()
  const { locations } = useLocations()
  const { favoriteIds, toggleFavorite, t } = useAppContext()
  const [removing, setRemoving] = useState<string | null>(null)

  const favorites = locations.filter(l => favoriteIds.includes(l.id))

  const handleRemove = (id: string) => {
    setRemoving(id)
    setTimeout(() => { toggleFavorite(id); setRemoving(null) }, 350)
  }

  const count = favorites.length

  return (
    <div className="mx-auto animate-fade-in" style={{ maxWidth: 720 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="label-sm" style={{ marginBottom: 10 }}>{t('fav_subtitle')}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 800, margin: 0, color: '#1a2332', letterSpacing: '-0.02em' }}>{t('fav_title')}</h1>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: '#8a96a8', margin: 0, fontWeight: 500 }}>
            {count} {count === 1 ? t('fav_saved_one') : t('fav_saved_many')}
          </p>
        </div>
        <button onClick={() => navigate('/search')} className="btn btn-primary">
          <BookmarkPlus size={16} />{t('fav_add')}
        </button>
      </div>

      {/* List */}
      {favorites.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {favorites.map((loc, i) => {
            const meta       = getAQIMeta(loc.status)
            const isRemoving = removing === loc.id
            return (
              <div
                key={loc.id}
                className="card"
                style={{
                  overflow: 'hidden',
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
                  <div onClick={() => navigate(`/location/${encodeURIComponent(loc.name)}`)} style={{ flex: 1, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: '#1a2332', margin: 0 }}>{loc.name}</h3>
                      <span className={`aqi-chip ${meta.chipClass}`}>{meta.label}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.8rem', fontWeight: 800, color: meta.color, lineHeight: 1 }}>{Math.round(loc.aqi)}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#8a96a8', fontWeight: 500 }}>AQI</span>
                    </div>

                    <div style={{ height: 4, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden', maxWidth: 260, marginBottom: 12 }}>
                      <div style={{ height: '100%', width: `${aqiPercent(loc.aqi)}%`, background: meta.color, borderRadius: 999 }} />
                    </div>

                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#4a5568', margin: '0 0 10px', lineHeight: 1.55 }}>{loc.description}</p>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: meta.bgColor, border: `1px solid ${meta.borderColor}`, borderRadius: 10, padding: '0.35rem 0.8rem', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: meta.color, fontWeight: 600 }}>
                      {meta.elderNote}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, color: '#1d4ed8', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600 }}>
                      View details <ArrowRight size={13} />
                    </div>
                  </div>

                  {/* Remove button */}
                  <button onClick={() => handleRemove(loc.id)} className="btn btn-danger" style={{ flexShrink: 0, padding: '0.5rem' }} aria-label="Remove from favourites">
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
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: '#1a2332', margin: '0 0 8px' }}>{t('fav_empty_title')}</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#8a96a8', margin: 0, maxWidth: 300 }}>{t('fav_empty_desc')}</p>
          </div>
          <button onClick={() => navigate('/search')} className="btn btn-primary">
            <MapPin size={16} />{t('fav_browse')}
          </button>
        </div>
      )}
    </div>
  )
}
