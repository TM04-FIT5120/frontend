import { useState, useCallback } from 'react'
import { fetchAirQualityByCoords, airQualityToLocation } from '@/api/api'
import { useNavigate } from 'react-router-dom'
import {
  Navigation, Loader2, MapPin,
  AlertTriangle, ArrowRight, ChevronRight,
  X, ShieldCheck, Wind, Thermometer,
  LocateFixed, Info,
} from 'lucide-react'
import { isApproachingHighRiskPeriod } from '@/pages/ForecastPage'
import type { Location } from '@/data/locations'
import { getAQIMeta, aqiPercent } from '@/utils/aqiHelpers'
import { useLocations } from '@/hooks/useLocations'
import { AirQualityMap } from '@/components/AirQualityMap'

// ── Helpers ───────────────────────────────────────────────────────────────────
function findNearest(lat: number, lng: number, locs: Location[]): Location {
  return locs.reduce((best, loc) => {
    const d = Math.hypot(loc.lat - lat, loc.lng - lng)
    const bd = Math.hypot(best.lat - lat, best.lng - lng)
    return d < bd ? loc : best
  })
}

// ── Location confirmation modal ───────────────────────────────────────────────
function LocationConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#fff', borderRadius: 20, padding: '2rem',
          maxWidth: 360, width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <LocateFixed size={26} color="#1d4ed8" />
        </div>

        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: '#1a2332', margin: '0 0 8px' }}>
          Share Your Location?
        </h3>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: '#64748b', lineHeight: 1.65, margin: '0 0 20px' }}>
          We'll use your location to find the nearest air quality monitoring station and show you real-time conditions in your area. Your location is never stored or shared.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '0.65rem', borderRadius: 10,
              border: '1.5px solid #e2e8f0', background: '#fff',
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              fontSize: '0.9rem', color: '#475569', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '0.65rem', borderRadius: 10,
              border: 'none', background: '#1d4ed8',
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              fontSize: '0.9rem', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <LocateFixed size={14} /> Allow
          </button>
        </div>
      </div>
    </div>
  )
}

// ── AQI Scale bar ─────────────────────────────────────────────────────────────
function AQIScaleBar({ aqi }: { aqi: number }) {
  const pct = Math.min((aqi / 300) * 100, 100)
  return (
    <div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>
        AQI Scale
      </p>
      <div style={{ height: 7, borderRadius: 999, background: 'linear-gradient(90deg, #059669 0%, #eab308 20%, #ea580c 40%, #dc2626 60%, #7f1d1d 80%, #7f1d1d 100%)', marginBottom: 5 }} />
      <div style={{ position: 'relative', height: 12 }}>
        <div style={{
          position: 'absolute', top: 0,
          left: `clamp(0%, ${pct}%, 96%)`,
          width: 2, height: 10,
          background: '#1a2332', borderRadius: 999,
          transform: 'translateX(-50%)',
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: '#94a3b8' }}>
          <span>0</span><span>50</span><span>100</span><span>150</span><span>200</span><span>250</span><span>300+</span>
        </div>
      </div>
    </div>
  )
}

// ── Right panel: selected location detail ─────────────────────────────────────
function LocationDetailPanel({
  loc,
  onClose,
}: {
  loc: Location
  onClose: () => void
}) {
  const navigate = useNavigate()
  const meta = getAQIMeta(loc.status)

  return (
    <div style={{ background: meta.bgColor, border: `1.5px solid ${meta.borderColor}`, borderRadius: 16, padding: '1.25rem', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: '#1a2332', margin: 0 }}>{loc.name}</h3>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: meta.color, fontWeight: 600, margin: '2px 0 0' }}>{meta.label}</p>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <X size={14} color="#64748b" />
        </button>
      </div>

      {/* Big AQI number */}
      <div style={{ margin: '10px 0 12px' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.8rem', fontWeight: 800, color: meta.color, lineHeight: 1 }}>{Math.round(loc.aqi)}</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginLeft: 6 }}>AQI Index</span>
      </div>

      {/* Info rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <ShieldCheck size={15} color={meta.color} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, margin: '0 0 1px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#1a2332', margin: 0 }}>{meta.label}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <MapPin size={15} color="#64748b" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, margin: '0 0 1px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Coordinates</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#1a2332', margin: 0 }}>{loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}</p>
          </div>
        </div>

        {(loc.temperature != null || loc.humidity != null) && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Thermometer size={15} color="#64748b" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, margin: '0 0 1px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Conditions</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#1a2332', margin: 0 }}>
                {loc.temperature != null ? `${loc.temperature}°C` : ''}
                {loc.temperature != null && loc.humidity != null ? '  ·  ' : ''}
                {loc.humidity != null ? `${loc.humidity}% humidity` : ''}
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Wind size={15} color="#64748b" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, margin: '0 0 1px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Advisory</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, color: '#334155', margin: 0, lineHeight: 1.5 }}>{meta.elderNote}</p>
          </div>
        </div>
      </div>

      <AQIScaleBar aqi={loc.aqi} />

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          type="button"
          onClick={() => navigate(`/forecast?location=${encodeURIComponent(loc.name)}`)}
          style={{
            flex: 1, padding: '0.5rem 0.65rem',
            background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10,
            fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.78rem',
            color: '#475569', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}
        >
          Short-term Forecast
        </button>
        <button
          type="button"
          onClick={() => navigate(`/forecast?location=${encodeURIComponent(loc.name)}&tab=long`)}
          style={{
            flex: 1, padding: '0.5rem 0.65rem',
            background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10,
            fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.78rem',
            color: '#475569', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}
        >
          Long-term Forecast
        </button>
      </div>

      <button
        onClick={() => navigate(`/location/${encodeURIComponent(loc.name)}`)}
        style={{
          width: '100%', marginTop: 10, padding: '0.65rem',
          background: meta.color, border: 'none', borderRadius: 10,
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.9rem',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        View Full Details <ArrowRight size={14} />
      </button>
    </div>
  )
}

// ── Right panel: overview (no selection) ──────────────────────────────────────
function OverviewPanel({ locations }: { locations: Location[] }) {
  const goodCount = locations.filter(l => l.status === 'good').length
  const modCount  = locations.filter(l => l.status === 'moderate').length
  const badCount  = locations.filter(l => ['unhealthy', 'very-unhealthy', 'hazardous'].includes(l.status)).length

  const worst = [...locations].sort((a, b) => b.aqi - a.aqi)[0]
  const best  = [...locations].sort((a, b) => a.aqi - b.aqi)[0]

  return (
    <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Info size={16} color="#1d4ed8" />
        </div>
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase', margin: 0 }}>Overview</p>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#1a2332', margin: 0 }}>Malaysia Air Quality</h3>
        </div>
      </div>

      {/* Distribution */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[
          { count: goodCount, label: 'Good', color: '#059669', bg: '#ecfdf5' },
          { count: modCount,  label: 'Moderate', color: '#d97706', bg: '#fffbeb' },
          { count: badCount,  label: 'Unhealthy', color: '#ea580c', bg: '#fff7ed' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: 10, padding: '0.6rem 0.5rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.count}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: s.color, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Best / worst */}
      {worst && best && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          {[
            { label: 'Highest AQI', loc: worst, meta: getAQIMeta(worst.status) },
            { label: 'Cleanest Air', loc: best,  meta: getAQIMeta(best.status)  },
          ].map(({ label, loc, meta }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.55rem 0.75rem' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#1a2332', margin: '1px 0 0' }}>{loc.name}</p>
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: meta.color }}>{Math.round(loc.aqi)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Senior tip */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '0.65rem 0.85rem' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#1d4ed8', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Senior Tip</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#334155', margin: 0, lineHeight: 1.55 }}>
          Always check air quality before heading out for a walk or exercise. Click any marker on the map to see detailed conditions.
        </p>
      </div>
    </div>
  )
}

// ── Cities list ───────────────────────────────────────────────────────────────
function CitiesList({
  locations,
  selectedId,
  onSelect,
}: {
  locations: Location[]
  selectedId?: string
  onSelect: (loc: Location) => void
}) {
  const navigate = useNavigate()
  return (
    <div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#1a2332', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        All Cities
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {locations.map(loc => {
          const meta = getAQIMeta(loc.status)
          const isActive = selectedId === loc.id
          return (
            <div
              key={loc.id}
              onClick={() => onSelect(loc)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.55rem 0.75rem', borderRadius: 10, cursor: 'pointer',
                background: isActive ? meta.bgColor : '#fff',
                border: `1px solid ${isActive ? meta.borderColor : '#e2e8f0'}`,
                transition: 'all 0.15s',
              }}
            >
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: isActive ? 700 : 500, color: '#1a2332', margin: 0 }}>{loc.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 800, color: meta.color }}>{Math.round(loc.aqi)}</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                <ChevronRight
                  size={14} color="#94a3b8"
                  onClick={e => { e.stopPropagation(); navigate(`/location/${encodeURIComponent(loc.name)}`) }}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Station card (all-stations grid) ─────────────────────────────────────────
function StationCard({ loc, delay }: { loc: Location; delay: number }) {
  const navigate = useNavigate()
  const meta     = getAQIMeta(loc.status)
  return (
    <div
      onClick={() => navigate(`/location/${encodeURIComponent(loc.name)}`)}
      className="card card-hover cursor-pointer animate-fade-up"
      style={{ padding: '1.25rem', animationDelay: `${delay}ms` }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1a2332', margin: 0, lineHeight: 1.2 }}>{loc.name}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#8a96a8', margin: '3px 0 0' }}>Malaysia</p>
        </div>
        <span className={`aqi-chip ${meta.chipClass}`}>{meta.label}</span>
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.6rem', fontWeight: 800, color: meta.color, lineHeight: 1, marginBottom: 10 }}>
        {Math.round(loc.aqi)}
      </div>
      <div style={{ height: 4, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: '100%', width: `${aqiPercent(loc.aqi)}%`, background: meta.color, borderRadius: 999 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#4a5568', margin: 0, lineHeight: 1.5, flex: 1 }}>{meta.elderNote}</p>
        <ChevronRight size={15} color="#8a96a8" style={{ flexShrink: 0, marginTop: 2 }} />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function HomePage() {
  const navigate = useNavigate()
  const [userLoc, setUserLoc]                   = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating]             = useState(false)
  const [locError, setLocError]                 = useState<string | null>(null)
  const [showConfirm, setShowConfirm]           = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const { locations } = useLocations()

  const goodCount = locations.filter(l => l.status === 'good').length
  const warnCount = locations.filter(l => ['hazardous', 'very-unhealthy', 'unhealthy'].includes(l.status)).length

  const doGetLocation = useCallback(() => {
    setShowConfirm(false)
    setIsLocating(true)
    setLocError(null)
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported.')
      setIsLocating(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude }
        setUserLoc(pos)
        try {
          const data = await fetchAirQualityByCoords(pos.lat, pos.lng)
          setSelectedLocation(airQualityToLocation(data))
        } catch {
          // Fallback: find nearest from already-loaded static locations
          if (locations.length > 0) {
            setSelectedLocation(findNearest(pos.lat, pos.lng, locations))
          }
        }
        setIsLocating(false)
      },
      err => {
        setLocError(
          ['', 'Location access denied. Enable permissions in your browser.', 'Location unavailable.', 'Request timed out.'][err.code]
          ?? 'Unable to get location.',
        )
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [locations])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }} className="animate-fade-in">

      {/* Confirmation modal */}
      {showConfirm && (
        <LocationConfirmModal
          onConfirm={doGetLocation}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          padding: 0,
          border: 'none', overflow: 'hidden', position: 'relative',
          backgroundImage: 'url(/banner.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: 260,
        }}
      >
        {/* Dark overlay for readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(10,20,50,0.78) 0%, rgba(10,20,50,0.55) 60%, rgba(10,20,50,0.25) 100%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 20, maxWidth: 560 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: '0.3rem 0.9rem' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#86efac', animation: 'pulseDot 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)' }}>
              Live Malaysia Air Quality
            </span>
          </div>
          <div>
            <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              Your Air Quality<br />Guardian.
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.7 }}>
              Real-time monitoring across {locations.length} stations, helping seniors across Malaysia breathe safer and live better.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/search')}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.75rem 1.5rem', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.1)', color: '#ffffff', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
            >
              <MapPin size={16} /> Search Area
            </button>
          </div>

          {locError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.2)', borderRadius: 12, padding: '0.75rem 1rem', border: '1px solid rgba(239,68,68,0.4)' }}>
              <AlertTriangle size={16} color="#fca5a5" style={{ flexShrink: 0 }} />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#fca5a5', margin: 0 }}>{locError}</p>
            </div>
          )}
        </div>
      </div>

      {/* AC 2.2.2: Proactive high-risk season notice — links to Forecast / activity planning */}
      {isApproachingHighRiskPeriod() && (
        <div
          role="alert"
          className="card"
          style={{
            padding: '1rem 1.25rem',
            background: '#fffbeb',
            border: '1px solid #fde047',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={22} color="#ca8a04" style={{ flexShrink: 0 }} />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: '#1a2332', margin: 0, fontWeight: 500 }}>
              Haze season is approaching. Consider planning indoor alternatives during this period.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/forecast')}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            View Forecast <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Locations', value: locations.length, color: '#1d4ed8', bg: '#eff6ff' },
          { label: 'Good Air',        value: goodCount,        color: '#059669', bg: '#ecfdf5' },
          { label: 'Need Attention',  value: warnCount,        color: '#ea580c', bg: '#fff7ed' },
        ].map((s, i) => (
          <div key={s.label} className="card animate-fade-up" style={{ padding: '1.25rem', animationDelay: `${i * 70}ms`, background: s.bg }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: s.color, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Map + Info panel ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Map card */}
        <div className="card xl:col-span-2" style={{ overflow: 'hidden' }}>
          {/* Card header */}
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <p className="label-sm" style={{ marginBottom: 3 }}>Interactive Map</p>
              <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#1a2332' }}>Air Quality Map</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0' }}>Click a marker to see details</p>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isLocating}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {isLocating
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Locating…</>
                : <><Navigation size={14} /> Get My Location</>
              }
            </button>
          </div>

          {/* Leaflet map */}
          <div style={{ padding: '0 1.5rem' }}>
            <div style={{ height: 570, borderRadius: 12, overflow: 'hidden', border: '1px solid #e4e9f0', position: 'relative' }}>
              <AirQualityMap
                locations={locations}
                userLoc={userLoc}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
              />
              {/* Location-fetch loading overlay */}
              {isLocating && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 1000,
                  background: 'rgba(10,20,40,0.52)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
                }}>
                  <Loader2 size={40} color="#ffffff" style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                    Finding your location…
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
                    This may take a few seconds
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Legend — AC 1.2.1 scale */}
          <div style={{ padding: '0.85rem 1.5rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem 1.1rem', flexShrink: 0 }}>
            {[
              ['#059669', 'Good (0–50)'],
              ['#eab308', 'Moderate (51–100)'],
              ['#ea580c', 'Unhealthy (101–200)'],
              ['#dc2626', 'Very Unhealthy (201–300)'],
              ['#7f1d1d', 'Hazardous (>300)'],
            ].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Inter, sans-serif', fontSize: '0.73rem', color: '#8a96a8', fontWeight: 500 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Right info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {selectedLocation
            ? <LocationDetailPanel loc={selectedLocation} onClose={() => setSelectedLocation(null)} />
            : <OverviewPanel locations={locations} />
          }

          {/* Cities list — scrollable */}
          <div
            className="card"
            style={{ padding: '1rem', overflowY: 'auto', maxHeight: 320 }}
          >
            <CitiesList
              locations={locations}
              selectedId={selectedLocation?.id}
              onSelect={loc => setSelectedLocation(loc)}
            />
          </div>
        </div>
      </div>

      {/* ── All stations grid ─────────────────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.3rem', fontWeight: 700, margin: 0, color: '#1a2332' }}>All Stations</h2>
          <button onClick={() => navigate('/search')} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            View all <ArrowRight size={13} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {locations.map((loc, i) => <StationCard key={loc.id} loc={loc} delay={i * 50} />)}
        </div>
      </div>

    </div>
  )
}
