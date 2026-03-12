import { useState } from 'react'
import { Bell, Moon, Globe, Ruler, Save, RotateCcw, CheckCircle2, ChevronDown, Info, Heart } from 'lucide-react'

type Units    = 'metric' | 'imperial'
type Language = 'english' | 'chinese' | 'malay' | 'tamil'

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        width: 50, height: 28,
        borderRadius: 999,
        border: 'none',
        background: checked ? '#1d4ed8' : '#e4e9f0',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        flexShrink: 0,
        boxShadow: checked ? '0 2px 8px rgba(29,78,216,0.3)' : 'inset 0 1px 2px rgba(0,0,0,0.06)',
        padding: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3, left: checked ? 25 : 3,
        width: 22, height: 22,
        borderRadius: '50%',
        background: '#ffffff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </button>
  )
}

// ── Setting row ───────────────────────────────────────────────────────────────
function SettingRow({ icon: Icon, iconColor, iconBg, title, desc, control }: {
  icon: React.ElementType; iconColor: string; iconBg: string; title: string; desc: string; control: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '1.1rem 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={iconColor} />
        </div>
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#1a2332', margin: 0 }}>{title}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#8a96a8', margin: '2px 0 0', fontWeight: 400 }}>{desc}</p>
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{control}</div>
    </div>
  )
}

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode]           = useState(false)
  const [language, setLanguage]           = useState<Language>('english')
  const [units, setUnits]                 = useState<Units>('metric')
  const [saved, setSaved]                 = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const langs: { value: Language; label: string }[] = [
    { value: 'english', label: 'English'         },
    { value: 'chinese', label: 'Chinese (中文)'  },
    { value: 'malay',   label: 'Bahasa Melayu'   },
    { value: 'tamil',   label: 'Tamil (தமிழ்)'  },
  ]

  return (
    <div className="mx-auto animate-fade-in" style={{ maxWidth: 620 }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <p className="label-sm" style={{ marginBottom: 8 }}>Preferences</p>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#1a2332', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Settings</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: '#4a5568', margin: 0, lineHeight: 1.65 }}>Customise your MyAirSafe experience.</p>
      </div>

      {/* ── General ─────────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '0 1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ padding: '1rem 0 0.25rem', borderBottom: '1px solid #f1f5f9' }}>
          <p className="label-sm">General</p>
        </div>
        <SettingRow
          icon={Bell} iconColor="#1d4ed8" iconBg="#eff6ff"
          title="Air Quality Alerts"
          desc="Get notified when air quality changes in your area"
          control={<Toggle checked={notifications} onChange={setNotifications} />}
        />
        <SettingRow
          icon={Moon} iconColor="#7c3aed" iconBg="#f5f3ff"
          title="Dark Mode"
          desc="Switch to a darker interface theme (coming soon)"
          control={<Toggle checked={darkMode} onChange={setDarkMode} />}
        />
        <div style={{ paddingBottom: '0.25rem' }} />
      </div>

      {/* ── Localisation ────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '0 1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ padding: '1rem 0 0.25rem', borderBottom: '1px solid #f1f5f9' }}>
          <p className="label-sm">Localisation</p>
        </div>

        <SettingRow
          icon={Globe} iconColor="#059669" iconBg="#ecfdf5"
          title="Language"
          desc="Choose your preferred display language"
          control={
            <div style={{ position: 'relative' }}>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as Language)}
                style={{ appearance: 'none', WebkitAppearance: 'none', background: '#f9fafb', border: '1.5px solid #e4e9f0', borderRadius: 10, padding: '0.5rem 2.2rem 0.5rem 0.9rem', fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: '#1a2332', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => (e.target.style.borderColor = '#1d4ed8')}
                onBlur={e  => (e.target.style.borderColor = '#e4e9f0')}
              >
                {langs.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <ChevronDown size={14} color="#8a96a8" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          }
        />

        <SettingRow
          icon={Ruler} iconColor="#d97706" iconBg="#fffbeb"
          title="Measurement Units"
          desc="Choose your preferred unit system"
          control={
            <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1.5px solid #e4e9f0' }}>
              {(['metric','imperial'] as Units[]).map(u => (
                <button
                  key={u} type="button"
                  onClick={() => setUnits(u)}
                  style={{
                    padding: '0.45rem 1rem',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 700,
                    textTransform: 'capitalize', border: 'none', cursor: 'pointer',
                    background: units === u ? '#1d4ed8' : '#f9fafb',
                    color: units === u ? '#ffffff' : '#8a96a8',
                    transition: 'all 0.15s ease',
                  }}
                >{u}</button>
              ))}
            </div>
          }
        />
        <div style={{ paddingBottom: '0.25rem' }} />
      </div>

      {/* ── Senior note ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, padding: '1.1rem 1.4rem', marginBottom: '1.25rem' }}>
        <Heart size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#dc2626', margin: '0 0 4px' }}>Designed for Senior Wellbeing</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
            MyAirSafe uses clear text, high contrast colours, and elder-focused health guidance throughout.
          </p>
        </div>
      </div>

      {/* ── Info ────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#f9fafb', border: '1px solid #e4e9f0', borderRadius: 14, padding: '0.9rem 1.1rem', marginBottom: '2rem' }}>
        <Info size={15} color="#8a96a8" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#8a96a8', margin: 0, lineHeight: 1.6 }}>
          Settings are saved locally in your browser. Dark mode and multilingual support will be fully available in a future update.
        </p>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={() => { setNotifications(true); setDarkMode(false); setLanguage('english'); setUnits('metric') }} className="btn btn-secondary">
          <RotateCcw size={15} />Reset Defaults
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="btn btn-primary"
          style={{ background: saved ? '#059669' : undefined, minWidth: 160, justifyContent: 'center', transition: 'background 0.3s ease' }}
        >
          {saved ? <><CheckCircle2 size={16} />Saved!</> : <><Save size={16} />Save Changes</>}
        </button>
      </div>
    </div>
  )
}