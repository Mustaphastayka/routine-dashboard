function EmptyState({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-white/10 bg-slate-950/35 px-4 py-5 text-sm text-slate-400 ${className}`.trim()}
    >
      {children}
    </div>
  )
}

export default EmptyState
