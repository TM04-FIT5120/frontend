import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Heart, MapPin, Wind, Droplets, Eye,
  TrendingUp, TrendingDown, Clock, Shield, AlertTriangle,
  CheckCircle2, Calendar,
} from 'lucide-react'
import { getAQIMeta, aqiPercent } from '@/utils/aqiHelpers'
import { useLocationDetail } from '@/hooks/useLocationDetail'
import { useAppContext } from '@/context/AppContext'

// ── Donut gauge ────────────────────────────────────────────────────────────────
function AQIDonut({ aqi, color, size = 160 }: { aqi: number; color: string; size?: number }) {
  const r   = (size / 2) - 11
  const c   = 2 * Math.PI * r
  const pct = Math.min(aqi / 300, 1)
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

// ── 7-Day AQI line chart ────────────────────────────────────────────────────────
function SevenDayLineChart({
  history,
  lineColor,
}: {
  history: { d: string; v: number }[]
  lineColor: string
}) {
  const W = 600
  const H = 160
  const PAD = 20

  const values  = history.map(h => h.v)
  const maxV    = Math.max(...values)
  const minV    = Math.min(...values)
  const range   = maxV - minV || 1
  const n       = history.length

  const getX = (i: number) => PAD + (i / Math.max(n - 1, 1)) * (W - PAD * 2)
  const getY = (v: number) => PAD + ((maxV - v) / range) * (H - PAD * 2)

  const points  = history.map((item, i) => ({ x: getX(i), y: getY(item.v), v: item.v, d: item.d }))
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')
  const areaPath =
    `M${points[0].x},${H} ` +
    points.map(p => `L${p.x},${p.y}`).join(' ') +
    ` L${points[points.length - 1].x},${H} Z`

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${W} ${H + 40}`}
        style={{ width: '100%', minWidth: 320, display: 'block' }}
        aria-label="7-day AQI forecast line chart"
      >
        <defs>
          <linearGradient id="aqiAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={lineColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line
            key={i}
            x1={PAD}           y1={PAD + t * (H - PAD * 2)}
            x2={W - PAD}       y2={PAD + t * (H - PAD * 2)}
            stroke="#f0f0f0"   strokeWidth="1"
          />
        ))}

        {/* Gradient area fill */}
        <path d={areaPath} fill="url(#aqiAreaGrad)" />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Markers, value labels, day labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={lineColor} strokeWidth="2.5" />
            <text
              x={p.x} y={p.y - 10}
              textAnchor="middle" fontSize="11"
              fill="#374151" fontWeight="600" fontFamily="Inter, sans-serif"
            >
              {Math.round(p.v)}
            </text>
            <text
              x={p.x} y={H + 30}
              textAnchor="middle" fontSize="12"
              fill="#9ca3af" fontFamily="Inter, sans-serif"
            >
              {p.d}
            </text>
          </g>
        ))}
      </svg>
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
            onClick={() => location && toggleFavorite(location)}
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
            <p className="label-sm" style={{ marginBottom: 8 }}>AQI Scale</p>
            <p className="label-sm" style={{ marginBottom: 8 }}>0–50 Good, 51–100 Moderate, 101–200 Unhealthy, 201–300 Very Unhealthy, 300+ Hazardous</p>
            <div style={{ position: 'relative', height: 8, borderRadius: 999, background: 'linear-gradient(90deg, #059669 0%, #eab308 20%, #ea580c 40%, #dc2626 60%, #7f1d1d 80%, #7f1d1d 100%)', marginBottom: 6 }}>
              <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)', width: 18, height: 18, borderRadius: '50%', background: '#fff', border: `3px solid ${color}`, boxShadow: '0 1px 6px rgba(0,0,0,0.15)', transition: 'left 1s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              {['0','50','100','150','200','250','300+'].map(v => <span key={v} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#8a96a8', fontWeight: 500 }}>{v}</span>)}
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

      {/* ── Forecast links (AC 2.1 / 2.2) ─────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => navigate(`/forecast?location=${encodeURIComponent(location.name)}`)}
          className="btn btn-outline"
          style={{ flex: '1 1 180px', padding: '0.6rem 1rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <TrendingUp size={16} /> Short-term Forecast
        </button>
        <button
          type="button"
          onClick={() => navigate(`/forecast?location=${encodeURIComponent(location.name)}&tab=long`)}
          className="btn btn-outline"
          style={{ flex: '1 1 180px', padding: '0.6rem 1rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Calendar size={16} /> Long-term Forecast
        </button>
      </div>

      {/* ── Metric cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard icon={Wind}     label="PM2.5"    value={(location.pm25 ?? location.aqi * 0.4).toFixed(1)} unit="µg/m³"    color="#1d4ed8" bg="#eff6ff" />
        <MetricCard icon={Droplets} label="Humidity" value={String(location.humidity ?? 65)}                  unit="%"        color="#059669" bg="#ecfdf5" />
        <MetricCard icon={Eye}      label="Temperature" value={location.temperature != null ? String(location.temperature) : '—'} unit="°C" color="#7c3aed" bg="#f5f3ff" />
        <MetricCard icon={trend > 0 ? TrendingUp : TrendingDown} label="Trend" value={`${trend > 0 ? '+' : ''}${trend}`} unit="7-day change" color={trend > 0 ? '#dc2626' : '#059669'} bg={trend > 0 ? '#fef2f2' : '#ecfdf5'} />
      </div>

      {/* ── 7-Day AQI Forecast (line chart with area fill) ─────────────────────── */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#1a2332' }}>7-Day AQI Forecast</h3>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#8a96a8', fontWeight: 500 }}>Predicted air quality index</span>
        </div>

        <SevenDayLineChart history={history} lineColor={color} />

        {/* Min / Max */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, marginBottom: 10 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
            Min: <strong style={{ color: '#1a2332' }}>{Math.round(Math.min(...history.map(d => d.v)))}</strong>
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
            Max: <strong style={{ color: '#1a2332' }}>{Math.round(maxV)}</strong>
          </span>
        </div>

        {/* AQI colour scale */}
        <div>
          <div style={{ height: 8, borderRadius: 4, background: 'linear-gradient(90deg, #059669 0%, #eab308 20%, #ea580c 40%, #dc2626 60%, #7f1d1d 100%)' }} aria-hidden />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {['0', '50', '100', '150', '200', '250', '300+'].map(v => (
              <span key={v} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#8a96a8', fontWeight: 500 }}>{v}</span>
            ))}
          </div>
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