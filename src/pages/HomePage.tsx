import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Navigation, Loader2, MapPin,
  CheckCircle2, AlertTriangle, ArrowRight,
  ChevronRight,
} from 'lucide-react'
import type { Location } from '@/data/locations'
import { getAQIMeta, aqiPercent } from '@/utils/aqiHelpers'
import { useLocations } from '@/hooks/useLocations'

// ── AQI ring gauge ────────────────────────────────────────────────────────────
function AQIRing({ aqi, color, size = 120 }: { aqi: number; color: string; size?: number }) {
  const r    = (size / 2) - 10
  const circ = 2 * Math.PI * r
  const pct  = Math.min(aqi / 500, 1)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="9" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: size > 100 ? '1.5rem' : '1.3rem', fontWeight: 800, color, lineHeight: 1 }}>{aqi}</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 600, color: '#8a96a8', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>AQI</span>
      </div>
    </div>
  )
}

// ── Station card ──────────────────────────────────────────────────────────────
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

      {/* AQI number */}
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.6rem', fontWeight: 800, color: meta.color, lineHeight: 1, marginBottom: 10 }}>
        {loc.aqi}
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: '100%', width: `${aqiPercent(loc.aqi)}%`, background: meta.color, borderRadius: 999 }} />
      </div>

      {/* Elder note */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#4a5568', margin: 0, lineHeight: 1.5, flex: 1 }}>{meta.elderNote}</p>
        <ChevronRight size={15} color="#8a96a8" style={{ flexShrink: 0, marginTop: 2 }} />
      </div>
    </div>
  )
}

// ── Featured card ─────────────────────────────────────────────────────────────
function FeaturedCard({ loc }: { loc: Location }) {
  const navigate = useNavigate()
  const meta     = getAQIMeta(loc.status)

  return (
    <div
      onClick={() => navigate(`/location/${encodeURIComponent(loc.name)}`)}
      className="card card-hover cursor-pointer animate-fade-up"
      style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}
    >
      {/* Colour accent strip on top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: meta.color, borderRadius: '16px 16px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p className="label-sm" style={{ marginBottom: 6 }}>Featured Station</p>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.3rem', fontWeight: 700, margin: 0, color: '#1a2332', lineHeight: 1.2 }}>{loc.name}</h3>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#8a96a8', margin: '4px 0 0' }}>Malaysia · Live data</p>
        </div>
        <span className={`aqi-chip ${meta.chipClass}`}>{meta.label}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <AQIRing aqi={loc.aqi} color={meta.color} size={120} />
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: '#4a5568', lineHeight: 1.65, margin: '0 0 10px' }}>{loc.description}</p>
          <div style={{ background: meta.bgColor, border: `1px solid ${meta.borderColor}`, borderRadius: 10, padding: '0.55rem 0.85rem' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: meta.color, margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
              {meta.elderNote}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1d4ed8', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600 }}>
        View full details <ArrowRight size={14} />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function HomePage() {
  const navigate    = useNavigate()
  const [userLoc, setUserLoc]       = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locError, setLocError]     = useState<string | null>(null)

  const { locations } = useLocations()

  const goodCount = locations.filter(l => l.status === 'good').length
  const warnCount = locations.filter(l => ['hazardous','very-unhealthy','unhealthy'].includes(l.status)).length
  const featured  = [locations[0], locations[1]]

  const handleGetLocation = () => {
    setIsLocating(true); setLocError(null)
    if (!navigator.geolocation) { setLocError('Geolocation not supported.'); setIsLocating(false); return }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setUserLoc({ lat: coords.latitude, lng: coords.longitude }); setIsLocating(false) },
      (err) => {
        setLocError(['', 'Access denied. Enable location permissions.', 'Location unavailable.', 'Request timed out.'][err.code] ?? 'Unable to get location.')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }} className="animate-fade-in">

      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          padding: '2.5rem',
          background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 40%, #2563eb 100%)',
          border: 'none',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Soft light wash */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: 200, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 20 }} className="md:flex-row md:items-center md:justify-between">
          <div style={{ maxWidth: 500 }}>
            {/* Live badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: '0.3rem 0.9rem', marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#86efac', animation: 'pulseDot 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)' }}>
                Live Malaysia Air Quality
              </span>
            </div>

            <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              Your Air Quality<br />Guardian.
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.7, maxWidth: 400 }}>
              Real-time monitoring across {locations.length} stations, helping seniors across Malaysia breathe safer and live better.
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
            <button
              onClick={handleGetLocation}
              disabled={isLocating}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none', background: '#ffffff', color: '#1d4ed8', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', minWidth: 180, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'all 0.2s' }}
            >
              {isLocating ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />Locating…</> : <><Navigation size={16} />My Location</>}
            </button>
            <button
              onClick={() => navigate('/search')}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.75rem 1.5rem', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)', color: '#ffffff', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <MapPin size={16} />Search Area
            </button>
          </div>
        </div>

        {/* Location result */}
        {(userLoc || locError) && (
          <div style={{ position: 'relative', marginTop: 20, display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.875rem 1rem', border: '1px solid rgba(255,255,255,0.2)' }}>
            {userLoc
              ? <><CheckCircle2 size={18} color="#86efac" style={{ flexShrink: 0, marginTop: 1 }} /><div><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: '#ffffff', margin: '0 0 2px' }}>Location acquired</p><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{userLoc.lat.toFixed(5)}, {userLoc.lng.toFixed(5)}</p></div></>
              : <><AlertTriangle size={18} color="#fca5a5" style={{ flexShrink: 0, marginTop: 1 }} /><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: '#fca5a5', margin: 0 }}>{locError}</p></>
            }
          </div>
        )}
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Locations', value: locations.length, color: '#1d4ed8', bg: '#eff6ff' },
          { label: 'Good Air',        value: goodCount,        color: '#059669', bg: '#ecfdf5' },
          { label: 'Need Attention',  value: warnCount,        color: '#ea580c', bg: '#fff7ed' },
        ].map((s, i) => (
          <div key={s.label} className="animate-fade-up" style={{ padding: '1.25rem', animationDelay: `${i * 70}ms`, background: s.bg, borderRadius: 16 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: s.color, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Map + Featured ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Map panel */}
        <div className="card xl:col-span-2" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <p className="label-sm" style={{ marginBottom: 4 }}>Interactive Map</p>
              <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#1a2332' }}>Air Quality Map</h2>
            </div>
            <button onClick={handleGetLocation} disabled={isLocating} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              <Navigation size={14} />Locate Me
            </button>
          </div>

          {/* Map area */}
          <div style={{ position: 'relative', height: 320, margin: '0 1.5rem 1.5rem', borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(145deg, #e8f4fd 0%, #dbeafe 50%, #ede9fe 100%)', border: '1px solid #e4e9f0' }}>
            {/* Subtle grid */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(29,78,216,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(29,78,216,0.04) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

            {/* Station dots */}
            {[
              { top: '25%', left: '38%', status: 'good'      },
              { top: '50%', left: '25%', status: 'moderate'  },
              { top: '65%', left: '58%', status: 'unhealthy' },
              { top: '28%', left: '70%', status: 'hazardous' },
              { top: '75%', left: '38%', status: 'good'      },
              { top: '42%', left: '80%', status: 'moderate'  },
            ].map((dot, i) => {
              const c = getAQIMeta(dot.status).color
              return (
                <div key={i} style={{ position: 'absolute', top: dot.top, left: dot.left }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', width: 26, height: 26, borderRadius: '50%', background: c, opacity: 0.18, animation: `pulseDot ${2.5 + i * 0.4}s ease-in-out ${i * 0.3}s infinite` }} />
                    <div style={{ width: 13, height: 13, borderRadius: '50%', background: c, border: '2.5px solid #fff', boxShadow: `0 2px 8px ${c}60`, cursor: 'pointer', zIndex: 1 }} />
                  </div>
                </div>
              )
            })}

            {/* Centre placeholder text */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <MapPin size={32} color="rgba(29,78,216,0.25)" />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: '#8a96a8', margin: 0, fontWeight: 500 }}>Interactive map coming soon</p>
              {userLoc && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 999, padding: '0.3rem 0.9rem', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600 }}>
                  <MapPin size={12} />{userLoc.lat.toFixed(3)}, {userLoc.lng.toFixed(3)}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1.25rem' }}>
            {[
              ['#059669', 'Good (0–50)'],
              ['#d97706', 'Moderate (51–100)'],
              ['#ea580c', 'Unhealthy (101–200)'],
              ['#7c3aed', 'Hazardous (201+)'],
            ].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#8a96a8', fontWeight: 500 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Featured column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {featured.map(loc => <FeaturedCard key={loc.id} loc={loc} />)}
        </div>
      </div>

      {/* ── All stations ─────────────────────────────────────────────────────── */}
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