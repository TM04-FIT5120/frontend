import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronRight, ArrowLeft, FlaskConical } from 'lucide-react'
import { getAQIMeta, aqiPercent } from '@/utils/aqiHelpers'
import type { AQIStatus } from '@/utils/aqiHelpers'

// ── Dummy category entries ────────────────────────────────────────────────────
const TEST_CATEGORIES: { status: AQIStatus; aqi: number; description: string }[] = [
  {
    status:      'good',
    aqi:         28,
    description: 'Air quality is good. It is a great day to be active outside with no restrictions.',
  },
  {
    status:      'moderate',
    aqi:         59,
    description: 'Air quality is moderate. Sensitive groups should limit prolonged outdoor exertion.',
  },
  {
    status:      'unhealthy',
    aqi:         130,
    description: 'Air quality is unhealthy. Everyone may begin to experience health effects.',
  },
  {
    status:      'very-unhealthy',
    aqi:         220,
    description: 'Air quality is very unhealthy. Health alert: everyone may experience more serious health effects.',
  },
  {
    status:      'hazardous',
    aqi:         310,
    description: 'Air quality is hazardous. Health warning of emergency conditions! Everyone is likely to be affected.',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export function TestAqiPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto animate-fade-in" style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
        <button
          onClick={() => navigate('/')}
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#1a2332', margin: 0 }}>
              AQI Category Test
            </p>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#8a96a8', margin: 0 }}>
            Simulating all 5 AQI levels — Alor Setar, Kedah, Malaysia
          </p>
        </div>
      </div>

      {/* 5 category cards */}
      {TEST_CATEGORIES.map(({ status, aqi, description }) => {
        const meta = getAQIMeta(status)
        return (
          <div
            key={status}
            className="card card-hover"
            onClick={() => navigate(`/location/${encodeURIComponent('Alor Setar')}?testAqi=${status}`)}
            style={{ overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
          >
            {/* Left colour accent */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: meta.color }} />

            <div style={{ padding: '1.25rem 1.25rem 1.1rem 1.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Location icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: meta.bgColor, border: `1.5px solid ${meta.borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <MapPin size={22} color={meta.color} />
              </div>

              {/* Main content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#1a2332', margin: 0 }}>
                    Alor Setar, Kedah, Malaysia
                  </h3>
                  <span className={`aqi-chip ${meta.chipClass}`}>{meta.label}</span>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#4a5568', margin: '0 0 10px', lineHeight: 1.5 }}>
                  {description}
                </p>
                {/* Progress bar */}
                <div style={{ height: 4, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden', maxWidth: 260 }}>
                  <div style={{ height: '100%', width: `${aqiPercent(aqi)}%`, background: meta.color, borderRadius: 999 }} />
                </div>
              </div>

              {/* AQI number + details link */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 800, color: meta.color, lineHeight: 1 }}>
                    {aqi}
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 700, color: '#8a96a8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    AQI
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1d4ed8', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600 }}>
                  Details <ChevronRight size={13} />
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* DEV label */}
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', margin: '4px 0 0' }}>
        Development test — dummy data only
      </p>
    </div>
  )
}
