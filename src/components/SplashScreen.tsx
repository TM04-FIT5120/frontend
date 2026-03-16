import { useEffect, useState } from 'react'
import { Wind, Shield, Heart } from 'lucide-react'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase,    setPhase]    = useState<'loading' | 'ready' | 'exit'>('loading')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        return prev + (prev < 70 ? 2.5 : prev < 90 ? 1.5 : 0.8)
      })
    }, 40)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => setPhase('ready'),   200)
      setTimeout(() => setPhase('exit'),   1800)
      setTimeout(() => onComplete(),       2400)
    }
  }, [progress, onComplete])

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #e8f4fd 0%, #f0f8ff 40%, #ffffff 70%, #f5f9ff 100%)',
        transition: phase === 'exit' ? 'opacity 0.6s ease-out' : 'none',
        opacity:       phase === 'exit' ? 0 : 1,
        pointerEvents: phase === 'exit' ? 'none' : 'all',
      }}
    >
      {/* Soft background depth circles */}
      <div className="pointer-events-none absolute" style={{ width: 700, height: 700, top: '-20%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(ellipse, rgba(29,78,216,0.05) 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute" style={{ width: 500, height: 500, bottom: '-15%', left: '-5%',  background: 'radial-gradient(ellipse, rgba(5,150,105,0.06) 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute" style={{ width: 380, height: 380, top: '10%',  right: '-8%',   background: 'radial-gradient(ellipse, rgba(29,78,216,0.04) 0%, transparent 70%)' }} />

      {/* Breathing rings */}
      {[1, 2, 3].map(ring => (
        <div
          key={ring}
          className="pointer-events-none absolute rounded-full"
          style={{
            width:  280 + ring * 110,
            height: 280 + ring * 110,
            border: `1px solid rgba(29,78,216,${0.05 - ring * 0.012})`,
            animation: `breathe ${3.5 + ring * 0.7}s ease-in-out ${ring * 0.3}s infinite`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8 px-8 text-center">

        {/* Logo — bare on screen, no container, breathing */}
        <div className="animate-breathe">
          <img
            src="/logo-transparent-bg.png"
            alt="MyAirSafe"
            className="h-auto w-[340px] object-contain"
            style={{ filter: 'drop-shadow(0 10px 28px rgba(29,78,216,0.13))' }}
          />
        </div>

        {/* Tagline */}
        <p
          className="text-base leading-relaxed text-gray-500"
          style={{ animation: 'fadeUp 0.7s ease-out 0.4s both' }}
        >
          Real-time air quality monitoring,<br />
          designed for senior Malaysians.
        </p>

        {/* Feature chips */}
        <div
          className="flex flex-wrap justify-center gap-2"
          style={{ animation: 'fadeUp 0.7s ease-out 0.7s both' }}
        >
          {[
            { icon: Wind,   label: 'Live AQI Data'  },
            { icon: Shield, label: 'Health Alerts'  },
            { icon: Heart,  label: 'Elder Friendly' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm font-semibold text-blue-700"
            >
              <Icon size={13} />
              {label}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div
          className="w-full max-w-xs"
          style={{ animation: 'fadeUp 0.7s ease-out 1s both' }}
        >
          <div className="mb-2 flex justify-between">
            <span className="text-sm text-gray-400">
              {phase === 'ready' ? 'Ready' : 'Loading air quality data…'}
            </span>
            <span className="text-sm font-semibold text-blue-700">
              {Math.min(Math.round(progress), 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-700"
              style={{
                width: `${progress}%`,
                transition: 'width 0.1s linear',
                boxShadow: '0 0 6px rgba(59,130,246,0.35)',
              }}
            />
          </div>
        </div>

        {/* Attribution */}
        <p
          className="text-xs text-gray-400"
          style={{ animation: 'fadeUp 0.7s ease-out 1.2s both' }}
        >
          FIT5120 Team TM04
        </p>
      </div>
    </div>
  )
}