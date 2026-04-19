function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
            {eyebrow}
          </p>
        ) : null}
        {title ? <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3> : null}
        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export default SectionHeader
