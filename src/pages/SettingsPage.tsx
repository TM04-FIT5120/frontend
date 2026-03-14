import { useState } from 'react'
import { Bell, Moon, Globe, Ruler, Save, RotateCcw, CheckCircle2, ChevronDown, Info, Heart, AlertTriangle } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import type { Language } from '@/context/AppContext'

type Units = 'metric' | 'imperial'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      style={{ position: 'relative', width: 50, height: 28, borderRadius: 999, border: 'none', background: checked ? '#1d4ed8' : '#e4e9f0', cursor: 'pointer', transition: 'background 0.2s ease', flexShrink: 0, boxShadow: checked ? '0 2px 8px rgba(29,78,216,0.3)' : 'inset 0 1px 2px rgba(0,0,0,0.06)', padding: 0 }}
    >
      <div style={{ position: 'absolute', top: 3, left: checked ? 25 : 3, width: 22, height: 22, borderRadius: '50%', background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)' }} />
    </button>
  )
}

function SettingRow({ icon: Icon, iconColor, iconBg, title, desc, control, note }: { icon: React.ElementType; iconColor: string; iconBg: string; title: string; desc: string; control: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div style={{ padding: '1.1rem 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
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
      {note && <div style={{ marginTop: 8, marginLeft: 56 }}>{note}</div>}
    </div>
  )
}

export function SettingsPage() {
  const { settings, updateSettings, t } = useAppContext()
  const [saved, setSaved]               = useState(false)
  const [notifMsg, setNotifMsg]         = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const handleNotificationsToggle = async (value: boolean) => {
    if (!value) { updateSettings({ notifications: false }); setNotifMsg(null); return }
    if (!('Notification' in window)) { setNotifMsg({ type: 'error', text: t('notif_unsupported') }); return }
    let permission = Notification.permission
    if (permission === 'default') permission = await Notification.requestPermission()
    if (permission === 'granted') {
      updateSettings({ notifications: true })
      setNotifMsg({ type: 'ok', text: t('notif_enabled') })
      new Notification('MyAirSafe Alerts', { body: 'Air quality alerts are now enabled.', icon: '/logo-transparent-bg.png' })
    } else {
      setNotifMsg({ type: 'error', text: t('notif_denied') })
      updateSettings({ notifications: false })
    }
  }

  const handleReset = () => {
    updateSettings({ notifications: true, darkMode: false, language: 'english', units: 'metric' })
    setNotifMsg(null)
  }

  const langs: { value: Language; label: string }[] = [
    { value: 'english', label: 'English' },
    { value: 'chinese', label: 'Chinese (中文)' },
    { value: 'malay',   label: 'Bahasa Melayu' },
    { value: 'tamil',   label: 'Tamil (தமிழ்)' },
  ]

  return (
    <div className="mx-auto animate-fade-in" style={{ maxWidth: 620 }}>
      <div style={{ marginBottom: '2rem' }}>
        <p className="label-sm" style={{ marginBottom: 8 }}>{t('preferences')}</p>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#1a2332', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{t('settings_title')}</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: '#4a5568', margin: 0, lineHeight: 1.65 }}>{t('settings_subtitle')}</p>
      </div>

      <div className="card" style={{ padding: '0 1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ padding: '1rem 0 0.25rem', borderBottom: '1px solid #f1f5f9' }}>
          <p className="label-sm">{t('settings_general')}</p>
        </div>
        <SettingRow icon={Bell} iconColor="#1d4ed8" iconBg="#eff6ff"
          title={t('settings_notifications')} desc={t('settings_notifications_desc')}
          control={<Toggle checked={settings.notifications} onChange={handleNotificationsToggle} />}
          note={notifMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: notifMsg.type === 'ok' ? '#ecfdf5' : '#fef2f2', border: '1px solid ' + (notifMsg.type === 'ok' ? '#a7f3d0' : '#fecaca'), borderRadius: 8, padding: '0.4rem 0.75rem' }}>
              <AlertTriangle size={13} color={notifMsg.type === 'ok' ? '#059669' : '#dc2626'} />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: notifMsg.type === 'ok' ? '#059669' : '#dc2626', margin: 0, fontWeight: 500 }}>{notifMsg.text}</p>
            </div>
          )}
        />
        <SettingRow icon={Moon} iconColor="#7c3aed" iconBg="#f5f3ff"
          title={t('settings_darkmode')} desc={t('settings_darkmode_desc')}
          control={<Toggle checked={settings.darkMode} onChange={v => updateSettings({ darkMode: v })} />}
        />
        <div style={{ paddingBottom: '0.25rem' }} />
      </div>

      <div className="card" style={{ padding: '0 1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ padding: '1rem 0 0.25rem', borderBottom: '1px solid #f1f5f9' }}>
          <p className="label-sm">{t('settings_localisation')}</p>
        </div>
        <SettingRow icon={Globe} iconColor="#059669" iconBg="#ecfdf5"
          title={t('settings_language')} desc={t('settings_language_desc')}
          control={
            <div style={{ position: 'relative' }}>
              <select value={settings.language} onChange={e => updateSettings({ language: e.target.value as Language })}
                style={{ appearance: 'none', WebkitAppearance: 'none', background: '#f9fafb', border: '1.5px solid #e4e9f0', borderRadius: 10, padding: '0.5rem 2.2rem 0.5rem 0.9rem', fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: '#1a2332', cursor: 'pointer', outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = '#1d4ed8')} onBlur={e => (e.target.style.borderColor = '#e4e9f0')}
              >
                {langs.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <ChevronDown size={14} color="#8a96a8" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          }
        />
        <div style={{ paddingBottom: '0.25rem' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, padding: '1.1rem 1.4rem', marginBottom: '1.25rem' }}>
        <Heart size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#dc2626', margin: '0 0 4px' }}>{t('settings_senior_title')}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{t('settings_senior_desc')}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#f9fafb', border: '1px solid #e4e9f0', borderRadius: 14, padding: '0.9rem 1.1rem', marginBottom: '2rem' }}>
        <Info size={15} color="#8a96a8" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#8a96a8', margin: 0, lineHeight: 1.6 }}>{t('settings_info')}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={handleReset} className="btn btn-secondary">
          <RotateCcw size={15} />{t('settings_reset')}
        </button>
        <button type="button" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500) }}
          className="btn btn-primary"
          style={{ background: saved ? '#059669' : undefined, minWidth: 160, justifyContent: 'center', transition: 'background 0.3s ease' }}
        >
          {saved ? <><CheckCircle2 size={16} />{t('settings_saved')}</> : <><Save size={16} />{t('settings_save')}</>}
        </button>
      </div>
    </div>
  )
}
