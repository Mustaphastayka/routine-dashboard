import Header from './Header.jsx'
import MobileBottomNav from './MobileBottomNav.jsx'

function AppShell({
  appTitle,
  pageTitle,
  pageSubtitle,
  activePage,
  primaryNavItems,
  onNavigate,
  onOpenSettings,
  children,
}) {
  return (
    <div className="min-h-screen overflow-x-clip bg-slate-950 text-slate-100">
      <div className="mx-auto min-h-screen w-full max-w-md overflow-x-clip border-x border-white/5 bg-slate-950/90 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] md:max-w-5xl md:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,1))]">
        <Header
          appTitle={appTitle}
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          isSettingsActive={activePage === 'settings'}
          onOpenSettings={onOpenSettings}
        />
        <main className="min-w-0 px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-36 sm:px-6 md:px-8 md:pb-12 md:pt-36">
          {children}
        </main>
        <MobileBottomNav
          items={primaryNavItems}
          activePage={activePage}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  )
}

export default AppShell
