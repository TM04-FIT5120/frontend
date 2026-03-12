import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, ArrowRight, X, ChevronRight } from 'lucide-react'
import { locations } from '@/data/locations'
import { getAQIMeta, aqiPercent } from '@/utils/aqiHelpers'

export function SearchPage() {
  const [query,   setQuery]   = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const filtered = query.trim()
    ? locations.filter(l => l.name.toLowerCase().includes(query.toLowerCase()))
    : locations

  return (
    <div className="mx-auto animate-fade-in" style={{ maxWidth: 700 }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <p className="label-sm" style={{ marginBottom: 10 }}>Stations</p>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#1a2332', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Find Your Safe Spot
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: '#4a5568', margin: 0, lineHeight: 1.65 }}>
          Check real-time air quality for any monitored station across Malaysia.
        </p>
      </div>

      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', marginBottom: '1.75rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#ffffff',
          border: `1.5px solid ${focused ? '#1d4ed8' : '#e4e9f0'}`,
          borderRadius: 14,
          padding: '0.875rem 1.1rem',
          boxShadow: focused ? '0 0 0 3px rgba(29,78,216,0.1)' : 'var(--shadow-card)',
          transition: 'all 0.2s ease',
        }}>
          <Search size={20} color={focused ? '#1d4ed8' : '#8a96a8'} style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search city or district…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: '1.05rem', color: '#1a2332' }}
          />
          {query && (
            <button onClick={() => { setQuery(''); inputRef.current?.focus() }} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '0.25rem', cursor: 'pointer', display: 'flex', color: '#8a96a8' }}>
              <X size={15} />
            </button>
          )}
        </div>
        {query && (
          <p style={{ position: 'absolute', right: 0, bottom: -20, fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#8a96a8' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length > 0 ? (
          filtered.map((loc, i) => {
            const meta = getAQIMeta(loc.status)
            return (
              <div
                key={loc.id}
                onClick={() => navigate(`/location/${encodeURIComponent(loc.name)}`)}
                className="card card-hover cursor-pointer animate-fade-up"
                style={{ padding: '1.25rem 1.5rem', animationDelay: `${i * 40}ms`, position: 'relative', overflow: 'hidden' }}
              >
                {/* Left accent */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: meta.color, borderRadius: '16px 0 0 16px' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingLeft: 8 }}>
                  {/* Icon */}
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: meta.bgColor, border: `1px solid ${meta.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={18} color={meta.color} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#1a2332' }}>{loc.name}</span>
                      <span className={`aqi-chip ${meta.chipClass}`}>{meta.label}</span>
                    </div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#4a5568', margin: '0 0 10px', lineHeight: 1.55 }}>{loc.description}</p>
                    <div style={{ height: 3, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden', maxWidth: 220 }}>
                      <div style={{ height: '100%', width: `${aqiPercent(loc.aqi)}%`, background: meta.color, borderRadius: 999 }} />
                    </div>
                  </div>

                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.2rem', fontWeight: 800, color: meta.color, lineHeight: 1 }}>{loc.aqi}</div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, color: '#8a96a8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>AQI</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, color: '#1d4ed8', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 600 }}>
                      Details <ChevronRight size={13} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="card" style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={24} color="#8a96a8" />
            </div>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1a2332', margin: '0 0 4px' }}>No results found</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#8a96a8', margin: 0 }}>Try a different city name or clear your search.</p>
            </div>
            <button onClick={() => setQuery('')} className="btn btn-secondary">Clear search</button>
          </div>
        )}
      </div>
    </div>
  )
}