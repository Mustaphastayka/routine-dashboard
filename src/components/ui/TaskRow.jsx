import { Check, Pencil, Trash2 } from 'lucide-react'

function TaskRow({
  title,
  completed,
  onToggle,
  onEdit,
  onDelete,
  highlight = false,
  nextFocus = false,
  children,
}) {
  return (
    <label
      className={`group relative flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-all duration-200 sm:p-4 ${
        completed
          ? 'border-cyan-300/20 bg-cyan-400/8 opacity-80'
          : nextFocus
            ? 'border-cyan-200/40 bg-[linear-gradient(180deg,rgba(34,211,238,0.15),rgba(15,23,42,0.9))] shadow-[0_8px_30px_rgba(34,211,238,0.12)]'
            : highlight
              ? 'border-cyan-300/20 bg-cyan-400/5'
              : 'border-white/8 bg-slate-950/35 hover:border-white/12 hover:bg-white/[0.04]'
      }`}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={completed}
        onChange={onToggle}
      />
      <span
        className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
          completed
            ? 'border-cyan-300/30 bg-cyan-300 text-slate-950'
            : 'border-white/10 bg-slate-950/70 text-slate-400 hover:border-cyan-400'
        }`}
        aria-hidden="true"
      >
        <Check size={18} className={completed ? 'opacity-100' : 'opacity-0 hover:opacity-50'} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h5
              className={`text-sm font-medium sm:text-[15px] ${
                completed ? 'text-slate-500 line-through' : 'text-white'
              }`}
            >
              {title}
            </h5>

            {children ? (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {children}
              </div>
            ) : null}
          </div>

          {(onEdit || onDelete) ? (
            <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
              {onEdit ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    onEdit()
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
                  aria-label="Edit task"
                >
                  <Pencil size={18} />
                </button>
              ) : null}
              {onDelete ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    onDelete()
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
                  aria-label="Delete task"
                >
                  <Trash2 size={18} />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </label>
  )
}

export default TaskRow
