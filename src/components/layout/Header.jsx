import { Settings } from 'lucide-react'

function Header({
  appTitle,
  pageTitle,
  pageSubtitle,
  isSettingsActive,
  onOpenSettings,
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 mx-auto w-full max-w-md border-b border-white/6 bg-slate-950/88 px-4 pb-4 pt-4 backdrop-blur-xl sm:px-6 md:max-w-5xl md:px-8">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <span className="inline-flex max-w-full rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-200/90 sm:text-[11px] sm:tracking-[0.24em]">
            {appTitle}
          </span>
          <div>
            <h1 className="truncate text-xl font-semibold tracking-tight text-white sm:text-3xl">
              {pageTitle}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-400 line-clamp-2">
              {pageSubtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition focus:outline-none focus:ring-2 focus:ring-cyan-400/40 ${
            isSettingsActive
              ? 'border-cyan-300/30 bg-cyan-400/14 text-cyan-100 shadow-[0_12px_30px_rgba(34,211,238,0.12)]'
              : 'border-white/8 bg-white/5 text-slate-200 hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-cyan-100'
          }`}
          aria-label="Open settings page"
          aria-pressed={isSettingsActive}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}

export default Header
