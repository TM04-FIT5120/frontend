import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Heart, MapPin, Wind, Droplets, Eye,
  TrendingUp, TrendingDown, Clock, Shield, AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { getAQIMeta, aqiPercent } from '@/utils/aqiHelpers'
import { useLocationDetail } from '@/hooks/useLocationDetail'
import { useAppContext } from '@/context/AppContext'

// ── Donut gauge ────────────────────────────────────────────────────────────────
function AQIDonut({ aqi, color, size = 160 }: { aqi: number; color: string; size?: number }) {
  const r   = (size / 2) - 11
  const c   = 2 * Math.PI * r
  const pct = Math.min(aqi / 500, 1)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="11" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.0rem', fontWeight: 800, color, lineHeight: 1 }}>{aqi}</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 700, color: '#8a96a8', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>AQI</span>
      </div>
    </div>
  )
}

// ── Metric card ────────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, unit, color, bg }: {
  icon: React.ElementType; label: string; value: string; unit: string; color: string; bg: string
}) {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.7rem', fontWeight: 800, color: '#1a2332', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#8a96a8', marginTop: 2, fontWeight: 500 }}>{unit}</div>
      <div className="label-sm" style={{ marginTop: 6 }}>{label}</div>
    </div>
  )
}

export function LocationDetailPage() {
  const { cityName } = useParams()
  const navigate     = useNavigate()
  const { toggleFavorite, isFavorite } = useAppContext()

  const { location } = useLocationDetail(decodeURIComponent(cityName ?? ''))

  if (!location) {
    return (
      <div className="mx-auto" style={{ maxWidth: 600 }}>
        <div className="card" style={{ padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <MapPin size={36} color="#e4e9f0" />
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: '#8a96a8', margin: 0 }}>Location not found</h2>
          <button onClick={() => navigate('/')} className="btn btn-primary">Back to Home</button>
        </div>
      </div>
    )
  }

  const meta  = getAQIMeta(location.status)
  const color = meta.color
  const pct   = aqiPercent(location.aqi)

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const history = location.forecast7d
    ? location.forecast7d.map(d => ({ d: days[new Date(d.date).getDay()], v: d.aqi }))
    : [
        { d: 'Mon', v: Math.max(location.aqi - 22, 5) },
        { d: 'Tue', v: Math.max(location.aqi - 15, 5) },
        { d: 'Wed', v: Math.max(location.aqi - 9,  5) },
        { d: 'Thu', v: Math.max(location.aqi - 4,  5) },
        { d: 'Fri', v: location.aqi },
        { d: 'Sat', v: location.aqi + 6 },
        { d: 'Sun', v: location.aqi + 12 },
      ]
  const maxV  = Math.max(...history.map(d => d.v))
  const trend = history.length >= 2
    ? +(history[history.length - 1].v - history[0].v).toFixed(1)
    : 5.4

  return (
    <div className="mx-auto animate-fade-in" style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Nav bar ──────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.88rem' }}>
          <ArrowLeft size={15} />Back
        </button>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f1f5f9', borderRadius: 10, padding: '0.4rem 0.85rem', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#8a96a8', fontWeight: 500 }}>
            <Clock size={13} />{location.updateTime ?? 'Updated now'}
          </div>
          <button
            onClick={() => location && toggleFavorite(location.id)}
            style={{ padding: '0.5rem', borderRadius: 12, background: location && isFavorite(location.id) ? '#fef2f2' : '#f1f5f9', border: `1.5px solid ${location && isFavorite(location.id) ? '#fecaca' : '#e4e9f0'}`, cursor: 'pointer', display: 'flex', color: location && isFavorite(location.id) ? '#dc2626' : '#8a96a8', transition: 'all 0.2s' }}
          >
            <Heart size={20} fill={location && isFavorite(location.id) ? '#dc2626' : 'none'} />
          </button>
        </div>
      </div>

      {/* ── Hero card ─────────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        {/* Top colour bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: color, borderRadius: '16px 16px 0 0' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p className="label-sm" style={{ marginBottom: 8 }}>Air Quality Station</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MapPin size={20} color="#8a96a8" />
              <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 800, margin: 0, color: '#1a2332', lineHeight: 1, letterSpacing: '-0.02em' }}>{location.name}</h1>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#8a96a8', margin: '6px 0 0', fontWeight: 500 }}>Malaysia · Real-time</p>
          </div>
          <span className={`aqi-chip ${meta.chipClass}`} style={{ fontSize: '0.88rem', padding: '0.4rem 1rem' }}>{meta.label}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <AQIDonut aqi={location.aqi} color={color} />

          <div style={{ flex: 1, minWidth: 200 }}>
            {/* AQI scale */}
            <p className="label-sm" style={{ marginBottom: 8 }}>AQI Scale (0–500+)</p>
            <div style={{ position: 'relative', height: 8, borderRadius: 999, background: 'linear-gradient(90deg, #059669 0%, #d97706 30%, #ea580c 55%, #dc2626 78%, #7c3aed 100%)', marginBottom: 6 }}>
              <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)', width: 18, height: 18, borderRadius: '50%', background: '#fff', border: `3px solid ${color}`, boxShadow: '0 1px 6px rgba(0,0,0,0.15)', transition: 'left 1s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              {['0','100','200','300','400','500+'].map(v => <span key={v} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#8a96a8', fontWeight: 500 }}>{v}</span>)}
            </div>

            {/* Description */}
            <div style={{ background: '#f9fafb', border: '1px solid #e4e9f0', borderRadius: 12, padding: '0.875rem 1rem', marginBottom: '0.875rem' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#4a5568', margin: 0, lineHeight: 1.65 }}>{location.description}</p>
            </div>

            {/* Elder advisory */}
            <div style={{ background: meta.bgColor, border: `1px solid ${meta.borderColor}`, borderRadius: 12, padding: '0.875rem 1rem', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Shield size={18} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: meta.color, margin: 0, fontWeight: 600, lineHeight: 1.6 }}>{meta.elderNote}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Metric cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard icon={Wind}     label="PM2.5"    value={(location.pm25 ?? location.aqi * 0.4).toFixed(1)} unit="µg/m³"    color="#1d4ed8" bg="#eff6ff" />
        <MetricCard icon={Droplets} label="Humidity" value={String(location.humidity ?? 65)}                  unit="%"        color="#059669" bg="#ecfdf5" />
        <MetricCard icon={Eye}      label="Temperature" value={location.temperature != null ? String(location.temperature) : '—'} unit="°C" color="#7c3aed" bg="#f5f3ff" />
        <MetricCard icon={trend > 0 ? TrendingUp : TrendingDown} label="Trend" value={`${trend > 0 ? '+' : ''}${trend}`} unit="7-day change" color={trend > 0 ? '#dc2626' : '#059669'} bg={trend > 0 ? '#fef2f2' : '#ecfdf5'} />
      </div>

      {/* ── 7-day chart ───────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <p className="label-sm" style={{ marginBottom: 4 }}>Historical Data</p>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#1a2332' }}>7-Day AQI Trend</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#dc2626', fontWeight: 600 }}>
            <TrendingUp size={15} />+{trend} this week
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
          {history.map((item, i) => {
            const h     = ((item.v / maxV) * 80) + 8
            const isNow = i === 4
            return (
              <div key={item.d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ position: 'relative', width: '100%', height: 140, display: 'flex', alignItems: 'flex-end' }}>
                  {isNow && (
                    <div style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', background: color, color: '#fff', borderRadius: 6, padding: '2px 7px', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {item.v.toFixed(0)}
                    </div>
                  )}
                  <div style={{
                    width: '100%',
                    height: `${h}%`,
                    borderRadius: '6px 6px 3px 3px',
                    background: isNow ? color : '#f1f5f9',
                    border: `1px solid ${isNow ? color : '#e4e9f0'}`,
                    transition: 'height 0.8s cubic-bezier(0.4,0,0.2,1)',
                  }} />
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: isNow ? color : '#8a96a8', fontWeight: isNow ? 700 : 400 }}>{item.d}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Recommendations ───────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="#1d4ed8" />
          </div>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#1a2332' }}>Health Recommendations</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: CheckCircle2,  title: 'General Public', desc: location.status === 'good' ? 'Enjoy your outdoor activities freely today!' : 'Consider reducing extended outdoor exertion.', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
            { icon: AlertTriangle, title: 'Elderly and Sensitive Groups', desc: meta.elderNote, color: meta.color, bg: meta.bgColor, border: meta.borderColor },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: item.bg, border: `1px solid ${item.border}`, borderRadius: 14, padding: '1rem 1.25rem' }}>
              <item.icon size={20} color={item.color} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: item.color, margin: '0 0 4px' }}>{item.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: '#4a5568', margin: 0, lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}