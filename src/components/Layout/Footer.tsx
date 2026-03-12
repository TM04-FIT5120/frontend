export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-3 text-xs text-slate-500 sm:flex-row">
        <p>
          &copy; {new Date().getFullYear()} MyAirSafe. Built for safer daily planning for elderly
          Malaysians.
        </p>
        <p className="text-[0.7rem] sm:text-xs">
          Data and forecasts served by the backend services. Always follow official health advice.
        </p>
      </div>
    </footer>
  )
}