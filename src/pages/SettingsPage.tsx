import { useState } from 'react'
import { Bell, Save, RotateCcw, CheckCircle2, Info, Heart, AlertTriangle } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { strings } from '@/strings'

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
  const { settings, updateSettings } = useAppContext()
  const [saved, setSaved]               = useState(false)
  const [notifMsg, setNotifMsg]         = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const handleNotificationsToggle = async (value: boolean) => {
    if (!value) { updateSettings({ notifications: false }); setNotifMsg(null); return }
    if (!('Notification' in window)) { setNotifMsg({ type: 'error', text: strings['notif_unsupported'] }); return }
    let permission = Notification.permission
    if (permission === 'default') permission = await Notification.requestPermission()
    if (permission === 'granted') {
      updateSettings({ notifications: true })
      setNotifMsg({ type: 'ok', text: strings['notif_enabled'] })
      new Notification('MyAirSafe Alerts', { body: 'Air quality alerts are now enabled.', icon: '/logo-transparent-bg.png' })
    } else {
      setNotifMsg({ type: 'error', text: strings['notif_denied'] })
      updateSettings({ notifications: false })
    }
  }

  const handleReset = () => {
    updateSettings({ notifications: true, units: 'metric' })
    setNotifMsg(null)
  }

  return (
    <div className="mx-auto animate-fade-in" style={{ maxWidth: 620 }}>
      <div style={{ marginBottom: '2rem' }}>
        <p className="label-sm" style={{ marginBottom: 8 }}>{strings['preferences']}</p>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#1a2332', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{strings['settings_title']}</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: '#4a5568', margin: 0, lineHeight: 1.65 }}>{strings['settings_subtitle']}</p>
      </div>

      <div className="card" style={{ padding: '0 1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ padding: '1rem 0 0.25rem', borderBottom: '1px solid #f1f5f9' }}>
          <p className="label-sm">{strings['settings_general']}</p>
        </div>
        <SettingRow icon={Bell} iconColor="#1d4ed8" iconBg="#eff6ff"
          title={strings['settings_notifications']} desc={strings['settings_notifications_desc']}
          control={<Toggle checked={settings.notifications} onChange={handleNotificationsToggle} />}
          note={notifMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: notifMsg.type === 'ok' ? '#ecfdf5' : '#fef2f2', border: '1px solid ' + (notifMsg.type === 'ok' ? '#a7f3d0' : '#fecaca'), borderRadius: 8, padding: '0.4rem 0.75rem' }}>
              <AlertTriangle size={13} color={notifMsg.type === 'ok' ? '#059669' : '#dc2626'} />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: notifMsg.type === 'ok' ? '#059669' : '#dc2626', margin: 0, fontWeight: 500 }}>{notifMsg.text}</p>
            </div>
          )}
        />
        <div style={{ paddingBottom: '0.25rem' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, padding: '1.1rem 1.4rem', marginBottom: '1.25rem' }}>
        <Heart size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#dc2626', margin: '0 0 4px' }}>{strings['settings_senior_title']}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{strings['settings_senior_desc']}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#f9fafb', border: '1px solid #e4e9f0', borderRadius: 14, padding: '0.9rem 1.1rem', marginBottom: '2rem' }}>
        <Info size={15} color="#8a96a8" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#8a96a8', margin: 0, lineHeight: 1.6 }}>{strings['settings_info']}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={handleReset} className="btn btn-secondary">
          <RotateCcw size={15} />{strings['settings_reset']}
        </button>
        <button type="button" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500) }}
          className="btn btn-primary"
          style={{ background: saved ? '#059669' : undefined, minWidth: 160, justifyContent: 'center', transition: 'background 0.3s ease' }}
        >
          {saved ? <><CheckCircle2 size={16} />{strings['settings_saved']}</> : <><Save size={16} />{strings['settings_save']}</>}
        </button>
      </div>
    </div>
  )
}
