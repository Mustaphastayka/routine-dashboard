import NavItem from '../ui/NavItem.jsx'

function MobileBottomNav({ items, activePage, onNavigate }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md border-t border-white/8 bg-slate-950/92 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:static md:max-w-5xl md:border-t md:border-white/6 md:bg-transparent md:px-8 md:pb-6 md:pt-0">
      <div className="grid grid-cols-5 gap-2 md:mx-auto md:max-w-3xl">
        {items.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={item.id === activePage}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </div>
    </nav>
  )
}

export default MobileBottomNav
