import { Link, NavLink } from 'react-router-dom'

const navLinkBase =
  'px-3 py-2 text-sm font-semibold rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600'

export function Header() {
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
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/compare"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            Compare
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            Search
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            Favorites
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            Settings
          </NavLink>
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