export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/80">
      <div className="mx-auto max-w-7xl px-6 py-3 text-xs text-slate-500">
        <div className="flex flex-col items-center justify-between gap-1 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} MyAirSafe. Built for safer daily planning for elderly Malaysians.
          </p>
          <p className="text-[0.7rem] sm:text-xs text-slate-400">
            Always follow official health advice.
          </p>
        </div>
        <div className="mt-1 flex flex-col items-center gap-1 border-t border-slate-100 pt-1 text-[0.68rem] text-slate-400 sm:flex-row sm:justify-between">
          <p>
            AQI data sourced from{' '}
            <a
              href="https://aqicn.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-600"
            >
              aqicn.org
            </a>{' '}
            — World Air Quality Index Project.
          </p>
          <p>Logo and banner images generated with AI assistance.</p>
        </div>
      </div>
    </footer>
  )
}