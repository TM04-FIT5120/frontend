import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, X, ChevronRight, Loader2, Building2, GraduationCap, Home, Map } from 'lucide-react'
import { getAQIMeta, aqiPercent } from '@/utils/aqiHelpers'
import { useLocations } from '@/hooks/useLocations'
import { fetchAirQualityByCity, fetchAirQualityByCoords, fetchGeocodingSuggestions } from '@/api/api'
import type { GeocodingSuggestion } from '@/api/api'

// ── Helpers ───────────────────────────────────────────────────────────────────

function placeTypeLabel(s: GeocodingSuggestion): string {
  const cls  = s.class
  const type = s.type
  if (cls === 'amenity' && type === 'university')   return 'University'
  if (cls === 'amenity' && type === 'college')      return 'College'
  if (cls === 'amenity' && type === 'school')       return 'School'
  if (cls === 'place'   && type === 'city')         return 'City'
  if (cls === 'place'   && type === 'town')         return 'Town'
  if (cls === 'place'   && type === 'village')      return 'Village'
  if (cls === 'place'   && type === 'suburb')       return 'Suburb'
  if (cls === 'place'   && type === 'neighbourhood')return 'Neighbourhood'
  if (cls === 'place'   && type === 'quarter')      return 'Quarter'
  if (cls === 'landuse' && type === 'residential')  return 'Residential'
  if (cls === 'boundary')                           return 'District'
  if (cls === 'amenity')                            return 'Amenity'
  return 'Location'
}

function PlaceIcon({ s }: { s: GeocodingSuggestion }) {
  const cls  = s.class
  const type = s.type
  if (cls === 'amenity' && (type === 'university' || type === 'college' || type === 'school'))
    return <GraduationCap size={15} />
  if (cls === 'place' && (type === 'suburb' || type === 'neighbourhood' || type === 'quarter'))
    return <Home size={15} />
  if (cls === 'boundary' || (cls === 'place' && (type === 'city' || type === 'town')))
    return <Building2 size={15} />
  return <Map size={15} />
}

/** Shorten display_name to "Primary Name, State" */
function shortName(s: GeocodingSuggestion): string {
  const parts = s.display_name.split(', ')
  // Primary part is the first segment
  const primary = parts[0]
  const state   = s.address.state ?? parts[parts.length - 2] ?? ''
  if (state && !primary.toLowerCase().includes(state.toLowerCase())) {
    return `${primary}, ${state}`
  }
  return primary
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SearchPage() {
  const [query,        setQuery]        = useState('')
  const [focused,      setFocused]      = useState(false)
  const [suggestions,  setSuggestions]  = useState<GeocodingSuggestion[]>([])
  const [sugLoading,   setSugLoading]   = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [apiSearching, setApiSearching] = useState(false)
  const [apiError,     setApiError]     = useState<string | null>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const dropdownRef= useRef<HTMLDivElement>(null)
  const debounceRef= useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate   = useNavigate()
  const { locations } = useLocations()

  const filtered = query.trim()
    ? locations.filter(l => l.name.toLowerCase().includes(query.toLowerCase()))
    : locations

  // ── Geocoding autocomplete ──────────────────────────────────────────────────
  const fetchSuggestions = useCallback((q: string) => {
    if (q.length < 2) { setSuggestions([]); setShowDropdown(false); return }
    setSugLoading(true)
    fetchGeocodingSuggestions(q)
      .then(res => { setSuggestions(res); setShowDropdown(res.length > 0) })
      .catch(() => setSuggestions([]))
      .finally(() => setSugLoading(false))
  }, [])

  const handleQueryChange = (val: string) => {
    setQuery(val)
    setApiError(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val.trim()), 320)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current    && !inputRef.current.contains(e.target as Node)
      ) setShowDropdown(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleSuggestionClick = async (s: GeocodingSuggestion) => {
    setShowDropdown(false)
    setQuery(shortName(s))
    setApiError(null)
    setApiSearching(true)
    try {
      const data = await fetchAirQualityByCoords(parseFloat(s.lat), parseFloat(s.lon))
      navigate(`/location/${encodeURIComponent(data.cityName)}`)
    } catch {
      setApiError('Could not fetch air quality for this location. Try another nearby area.')
    } finally {
      setApiSearching(false)
    }
  }

  const handleSearchByApi = async () => {
    const q = query.trim()
    if (!q) return
    setShowDropdown(false)
    setApiError(null)
    setApiSearching(true)
    try {
      const data = await fetchAirQualityByCity(q)
      navigate(`/location/${encodeURIComponent(data.cityName)}`)
    } catch {
      setApiError('No air quality data found for this location. Try a city or station name (e.g. Kuala Lumpur, Penang).')
    } finally {
      setApiSearching(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setApiError(null)
    setSuggestions([])
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto animate-fade-in" style={{ maxWidth: 700 }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p className="label-sm" style={{ marginBottom: 10 }}>Stations</p>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#1a2332', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Find Your Safe Spot
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: '#4a5568', margin: 0, lineHeight: 1.65 }}>
          Search any city, suburb, residential area, university, or neighbourhood to get real-time air quality.
        </p>
      </div>

      {/* Search bar + autocomplete */}
      <div style={{ position: 'relative', marginBottom: '1.75rem' }}>

        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#ffffff',
          border: `1.5px solid ${focused ? '#1d4ed8' : '#e4e9f0'}`,
          borderRadius: showDropdown ? '14px 14px 0 0' : 14,
          padding: '0.875rem 1.1rem',
          boxShadow: focused ? '0 0 0 3px rgba(29,78,216,0.1)' : 'var(--shadow-card)',
          transition: 'all 0.2s ease',
          position: 'relative', zIndex: 11,
        }}>
          {sugLoading || apiSearching
            ? <Loader2 size={20} color="#1d4ed8" style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }} />
            : <Search size={20} color={focused ? '#1d4ed8' : '#8a96a8'} style={{ flexShrink: 0 }} />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onFocus={() => {
              setFocused(true)
              if (suggestions.length > 0) setShowDropdown(true)
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSearchByApi()
              if (e.key === 'Escape') setShowDropdown(false)
            }}
            placeholder="City, suburb, university, neighbourhood…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: '1.05rem', color: '#1a2332' }}
          />
          {query && (
            <button onClick={clearSearch} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '0.25rem', cursor: 'pointer', display: 'flex', color: '#8a96a8' }}>
              <X size={15} />
            </button>
          )}
        </div>

        {/* Autocomplete dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
              background: '#ffffff',
              border: '1.5px solid #1d4ed8',
              borderTop: '1px solid #e4e9f0',
              borderRadius: '0 0 14px 14px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '6px 12px 4px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#8a96a8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Suggested locations
              </span>
            </div>
            {suggestions.map(s => (
              <button
                key={s.place_id}
                onMouseDown={e => { e.preventDefault(); handleSuggestionClick(s) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '0.7rem 1rem',
                  background: 'transparent', border: 'none', borderBottom: '1px solid #f8fafc',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f0f5ff')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Type icon */}
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: '#eff6ff', color: '#1d4ed8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <PlaceIcon s={s} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#1a2332', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {shortName(s)}
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#8a96a8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.display_name}
                  </div>
                </div>

                <span style={{
                  flexShrink: 0,
                  background: '#eff6ff', color: '#1d4ed8',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 700,
                  padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {placeTypeLabel(s)}
                </span>
              </button>
            ))}
            <div style={{ padding: '6px 12px', background: '#f8fafc' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: '#b0bbc8' }}>
                Powered by OpenStreetMap · Malaysia only
              </span>
            </div>
          </div>
        )}

        {/* Below-bar actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {query && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#8a96a8', margin: 0 }}>
              {filtered.length} station{filtered.length !== 1 ? 's' : ''} match &ldquo;{query}&rdquo; · or select a suggestion above
            </p>
          )}
          {query.trim() && (
            <button
              type="button"
              onClick={handleSearchByApi}
              disabled={apiSearching}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {apiSearching
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Searching…</>
                : <><Search size={14} /> Get air quality for &ldquo;{query.trim()}&rdquo;</>
              }
            </button>
          )}
        </div>

        {apiError && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#dc2626', marginTop: 8 }}>{apiError}</p>
        )}
      </div>

      {/* Station list */}
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
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: meta.color, borderRadius: '16px 0 0 16px' }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingLeft: 8 }}>
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
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1a2332', margin: '0 0 4px' }}>No matching stations in list</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#8a96a8', margin: 0 }}>
                {query.trim()
                  ? 'Pick a suggestion from the dropdown, or press Enter / use the button to search any location.'
                  : 'Enter a city, suburb, university, or area name to search.'}
              </p>
            </div>
            {query.trim() && (
              <button
                type="button"
                onClick={handleSearchByApi}
                disabled={apiSearching}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {apiSearching
                  ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Searching…</>
                  : <><Search size={14} /> Get air quality for &ldquo;{query.trim()}&rdquo;</>
                }
              </button>
            )}
            <button onClick={clearSearch} className="btn btn-secondary">Clear search</button>
          </div>
        )}
      </div>
    </div>
  )
}
