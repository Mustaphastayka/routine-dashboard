function NavItem({ item, isActive, onClick }) {
  const Icon = item.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[4.5rem] min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border px-1 text-[11px] font-medium leading-tight transition sm:text-xs ${
        isActive
          ? 'border-cyan-300/30 bg-cyan-400/14 text-cyan-100 shadow-[0_12px_30px_rgba(34,211,238,0.12)]'
          : 'border-white/5 bg-white/[0.03] text-slate-400 hover:border-white/10 hover:bg-white/[0.05] hover:text-slate-200'
      }`}
      aria-pressed={isActive}
    >
      <Icon size={18} strokeWidth={2} />
      <span className="truncate">{item.label}</span>
    </button>
  )
}

export default NavItem
