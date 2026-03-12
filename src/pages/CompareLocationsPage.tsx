import { useState } from 'react'
import { ArrowRightLeft, TrendingDown, TrendingUp, Shield, ChevronDown } from 'lucide-react'
import { locations } from '@/data/locations'
import { getAQIMeta, aqiPercent } from '@/utils/aqiHelpers'

// ── Dropdown ──────────────────────────────────────────────────────────────────
function StationSelect({ value, onChange, exclude, label }: {
  value: string; onChange: (id: string) => void; exclude?: string; label: string
}) {
  return (
    <div>
      <p className="label-sm" style={{ marginBottom: 8 }}>{label}</p>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%',
            appearance: 'none', WebkitAppearance: 'none',
            background: '#fff',
            border: '1.5px solid #e4e9f0',
            borderRadius: 12,
            padding: '0.875rem 2.5rem 0.875rem 1rem',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#1a2332',
            outline: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-card)',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = '#1d4ed8')}
          onBlur={e  => (e.target.style.borderColor = '#e4e9f0')}
        >
          {locations.map(l => (
            <option key={l.id} value={l.id} disabled={l.id === exclude}>
              {l.name} — AQI {l.aqi}
            </option>
          ))}
        </select>
        <ChevronDown size={16} color="#8a96a8" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      </div>
    </div>
  )
}

// ── AQI ring ──────────────────────────────────────────────────────────────────
function AQIRing({ aqi, color, size = 120 }: { aqi: number; color: string; size?: number }) {
  const r = (size / 2) - 9; const c = 2 * Math.PI * r; const pct = Math.min(aqi / 300, 1)
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="9" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="9"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'all 1s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>{aqi}</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 600, color: '#8a96a8', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>AQI</span>
      </div>
    </div>
  )
}

// ── Location panel ────────────────────────────────────────────────────────────
function LocPanel({ loc, isWinner }: { loc: typeof locations[0]; isWinner: boolean }) {
  const meta = getAQIMeta(loc.status)
  return (
    <div className="card" style={{ overflow: 'hidden', border: isWinner ? `1.5px solid ${meta.color}50` : undefined, boxShadow: isWinner ? `var(--shadow-hover), 0 0 0 1px ${meta.color}20` : undefined }}>
      {/* Winner badge */}
      {isWinner && (
        <div style={{ position: 'absolute', top: 0, right: 0, background: meta.color, color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.28rem 0.85rem', borderRadius: '0 16px 0 10px', zIndex: 2 }}>
          Cleaner Air
        </div>
      )}

      {/* Colour top bar */}
      <div style={{ height: 5, background: meta.color }} />

      <div style={{ padding: '1.5rem' }}>
        <p className="label-sm" style={{ marginBottom: 6 }}>Station</p>
        <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: '#1a2332', margin: '0 0 3px' }}>{loc.name}</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#8a96a8', margin: '0 0 1.25rem', fontWeight: 500 }}>Malaysia · Live</p>

        <AQIRing aqi={loc.aqi} color={meta.color} />

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <span className={`aqi-chip ${meta.chipClass}`}>{meta.label}</span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 5, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden', margin: '1.25rem 0' }}>
          <div style={{ height: '100%', width: `${aqiPercent(loc.aqi)}%`, background: meta.color, borderRadius: 999, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>

        {/* Description */}
        <div style={{ background: '#f9fafb', border: '1px solid #e4e9f0', borderRadius: 12, padding: '0.75rem 0.9rem', marginBottom: '0.875rem' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', color: '#4a5568', margin: 0, lineHeight: 1.6 }}>{loc.description}</p>
        </div>

        {/* PM estimates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['PM2.5', (loc.aqi * 0.4).toFixed(1), 'µg/m³'], ['PM10', (loc.aqi * 0.65).toFixed(1), 'µg/m³']].map(([k, v, u]) => (
            <div key={k} style={{ background: '#f9fafb', border: '1px solid #e4e9f0', borderRadius: 10, padding: '0.65rem 0.8rem' }}>
              <p className="label-sm" style={{ marginBottom: 4 }}>{k}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: meta.color, margin: 0 }}>{v}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#8a96a8', margin: 0, fontWeight: 500 }}>{u}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function CompareLocationsPage() {
  const [loc1Id, setLoc1Id] = useState(locations[0].id)
  const [loc2Id, setLoc2Id] = useState(locations[1].id)

  const loc1   = locations.find(l => l.id === loc1Id) ?? locations[0]
  const loc2   = locations.find(l => l.id === loc2Id) ?? locations[1]
  const diff   = Math.abs(loc1.aqi - loc2.aqi)
  const winner = loc1.aqi < loc2.aqi ? 'loc1' : 'loc2'
  const winnerLoc = winner === 'loc1' ? loc1 : loc2
  const loserLoc  = winner === 'loc1' ? loc2 : loc1

  return (
    <div className="mx-auto animate-fade-in" style={{ maxWidth: 860 }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <p className="label-sm" style={{ marginBottom: 8 }}>Side by side</p>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#1a2332', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Compare Stations</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: '#4a5568', margin: 0, lineHeight: 1.65 }}>Compare air quality between any two monitoring stations.</p>
      </div>

      {/* ── Selectors ───────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'end', gap: '1rem' }}>
          <StationSelect value={loc1Id} onChange={setLoc1Id} exclude={loc2Id} label="First Station" />
          <button
            onClick={() => { setLoc1Id(loc2Id); setLoc2Id(loc1Id) }}
            style={{ padding: '0.75rem', borderRadius: 12, background: '#eff6ff', border: '1.5px solid #bfdbfe', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#1d4ed8', transition: 'all 0.2s', alignSelf: 'flex-end' }}
            title="Swap stations"
          >
            <ArrowRightLeft size={18} />
          </button>
          <StationSelect value={loc2Id} onChange={setLoc2Id} exclude={loc1Id} label="Second Station" />
        </div>
      </div>

      {/* ── Station cards ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <LocPanel loc={loc1} isWinner={winner === 'loc1'} />
        <LocPanel loc={loc2} isWinner={winner === 'loc2'} />
      </div>

      {/* ── Summary ─────────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRightLeft size={18} color="#1d4ed8" />
          </div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#1a2332' }}>Comparison Summary</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
          {/* AQI diff */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
            <p className="label-sm" style={{ marginBottom: 8, color: '#1d4ed8' }}>AQI Difference</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '2rem', color: '#1d4ed8', margin: '0 0 3px' }}>{diff.toFixed(1)}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#8a96a8', margin: 0, fontWeight: 500 }}>index points</p>
          </div>
          {/* Winner */}
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
            <p className="label-sm" style={{ marginBottom: 8, color: '#059669' }}>Cleaner Air</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#059669', margin: '0 0 3px' }}>{winnerLoc.name}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#8a96a8', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontWeight: 500 }}>
              <TrendingDown size={13} />Lower AQI
            </p>
          </div>
          {/* Loser */}
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
            <p className="label-sm" style={{ marginBottom: 8, color: '#ea580c' }}>More Polluted</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#ea580c', margin: '0 0 3px' }}>{loserLoc.name}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#8a96a8', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontWeight: 500 }}>
              <TrendingUp size={13} />Higher AQI
            </p>
          </div>
        </div>

        {/* Recommendation */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <Shield size={18} color="#1d4ed8" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#1d4ed8', margin: '0 0 4px' }}>Senior Recommendation</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: '#4a5568', margin: 0, lineHeight: 1.65 }}>
              <strong style={{ color: '#059669' }}>{winnerLoc.name}</strong> has significantly better air quality
              {diff > 50 ? ', a meaningful health difference for seniors' : ''}.
              {getAQIMeta(loserLoc.status).chipClass.includes('unhealthy') || getAQIMeta(loserLoc.status).chipClass.includes('hazardous')
                ? ' Elderly individuals should avoid outdoor activities in the more polluted area.'
                : ' Both locations are within acceptable ranges today.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}