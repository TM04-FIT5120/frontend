import { Link, NavLink } from 'react-router-dom'
import { useAppContext } from '@/context/AppContext'

const navLinkBase =
  'px-3 py-2 text-sm font-semibold rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600'

export function Header() {
  const { t } = useAppContext()

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo-transparent-bg.png"
            alt="MyAirSafe"
            className="h-9 w-auto object-contain"
          />
          <div className="hidden sm:block">
            <span className="block text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">
              Malaysia
            </span>
            <span className="block text-sm font-bold text-gray-800">
              Air Quality Dashboard
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav aria-label="Main navigation" className="flex gap-1 sm:gap-2">
          {[
            { to: '/',         end: true,  key: 'nav_home'      },
            { to: '/guide',    end: false, key: 'nav_guide'     },
            { to: '/compare',  end: false, key: 'nav_compare'   },
            { to: '/search',   end: false, key: 'nav_search'    },
            { to: '/favorites',end: false, key: 'nav_favorites' },
            { to: '/settings', end: false, key: 'nav_settings'  },
          ].map(({ to, end, key }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              {t(key)}
            </NavLink>
          ))}
        </nav>

        {/* Live indicator */}
        <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 sm:flex">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">Live</span>
        </div>

      </div>
    </header>
  )
}