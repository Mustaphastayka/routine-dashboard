function EmptyState({ children, className = '', action }) {
  return (
    <div
      className={`flex flex-col items-start gap-3 rounded-2xl border border-dashed border-white/10 bg-slate-950/35 px-4 py-5 text-sm text-slate-400 ${className}`.trim()}
    >
      <p>{children}</p>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex items-center justify-center rounded-xl bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  )
}

export default EmptyState
