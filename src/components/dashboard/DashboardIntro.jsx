import {
  ArrowRight,
  Check,
  CalendarDays,
  PiggyBank,
  Repeat,
} from 'lucide-react'
import { useState } from 'react'
import { readDashboardSnapshot } from '../../lib/dashboard.js'
import { togglePlannerTask } from '../../lib/planner.js'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'

const quickActions = [
  {
    id: 'routine',
    label: 'Open Routine',
    icon: Repeat,
  },
  {
    id: 'planner',
    label: 'Open Planner',
    icon: CalendarDays,
  },
  {
    id: 'budget',
    label: 'Open Budget',
    icon: PiggyBank,
  },
]

function DashboardIntro({ onNavigate }) {
  const [snapshot, setSnapshot] = useState(() => readDashboardSnapshot() ?? {
    date: { fullDate: 'Today' },
    greeting: 'Welcome back',
    routineCompletionPercentage: 0,
    routineName: '',
    routineStatusLabel: 'No routine today',
    routineCompletedCount: 0,
    routineTotalCount: 0,
    nextIncompleteRoutineItem: 'No routine selected yet',
    todaysPlannerTasks: [],
    topPlannerTasks: [],
    todaysSpendingAmount: 0,
    todaysSpendingCount: 0,
    currency: 'USD',
    hasRoutine: false,
  })
  const primaryTask = snapshot.topPlannerTasks[0] ?? null
  const secondaryTasks = snapshot.topPlannerTasks.slice(1, 3)
  const spendingLabel =
    snapshot.todaysSpendingCount > 0
      ? `${snapshot.todaysSpendingCount} logged`
      : 'Nothing logged'

  const handleDashboardPlannerToggle = (taskId) => {
    togglePlannerTask('today', taskId)
    setSnapshot(readDashboardSnapshot())
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <section className="min-w-0 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(8,15,30,0.96),rgba(15,23,42,0.75))] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.45)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
          Today
        </p>
        <p className="mt-3 text-sm text-slate-400">{snapshot.date.fullDate}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {snapshot.greeting}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          A quieter overview of what needs your attention next, without asking you to scan the whole system at once.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Routine
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {snapshot.routineCompletionPercentage}%
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Planner
            </p>
            <p className="mt-2 truncate text-sm font-medium text-white">
              {primaryTask?.title ?? 'Nothing urgent queued'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Spending
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: snapshot.currency,
                maximumFractionDigits: 2,
              }).format(snapshot.todaysSpendingAmount)}
            </p>
            <p className="mt-1 text-xs text-slate-500">{spendingLabel}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card as="section" variant="hero" className="bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.7))]">
          <SectionHeader eyebrow="Routine" title="Today's routine" />

          {snapshot.hasRoutine ? (
            <>
              <div className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">
                    {snapshot.routineName}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {snapshot.routineStatusLabel}
                  </p>
                </div>
                <span className="rounded-full border border-cyan-300/15 bg-cyan-400/[0.08] px-3 py-1 text-xs font-medium text-cyan-100">
                  {snapshot.routineCompletedCount} / {snapshot.routineTotalCount}
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-cyan-300 transition-[width]"
                  style={{ width: `${snapshot.routineCompletionPercentage}%` }}
                />
              </div>
            </>
          ) : (
            <EmptyState className="mt-4 bg-slate-950/30">
              No routine scheduled for today yet.
            </EmptyState>
          )}

          <Button className="mt-4 w-full" onClick={() => onNavigate('routine')}>
            Open Routine
          </Button>
        </Card>

        <Card className="bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.76))]">
          <SectionHeader
            eyebrow="Today's Planner"
            title="Quick control for today's tasks"
            description="Check tasks off here without leaving the dashboard."
          />

          {snapshot.todaysPlannerTasks.length > 0 ? (
            <div className="mt-4 space-y-3">
              {snapshot.todaysPlannerTasks.map((task) => (
                <label
                  key={task.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition ${
                    task.completed
                      ? 'border-cyan-300/20 bg-cyan-400/8 opacity-80'
                      : 'border-white/8 bg-slate-950/35 hover:border-white/12 hover:bg-white/[0.04]'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={task.completed}
                    onChange={() => handleDashboardPlannerToggle(task.id)}
                  />
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                      task.completed
                        ? 'border-cyan-300/30 bg-cyan-300 text-slate-950'
                        : 'border-white/10 bg-slate-950/70 text-slate-400'
                    }`}
                    aria-hidden="true"
                  >
                    <Check size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-medium ${
                        task.completed
                          ? 'text-slate-400 line-through'
                          : 'text-white'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                        {task.priority}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-400">
                        {task.dueDate || 'No due date'}
                      </span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <EmptyState className="mt-4">
              No planner tasks for today yet. Add one in Planner to make this your quick-control center.
            </EmptyState>
          )}

          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => onNavigate('planner')}
          >
            Open Planner
          </Button>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionHeader
            eyebrow="Upcoming"
            title="A small look ahead"
            action={<CalendarDays size={18} className="text-slate-400" />}
          />

          <div className="mt-4 space-y-3">
            {secondaryTasks.length > 0 ? (
              secondaryTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-3"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/8 bg-white/[0.04] text-sm font-semibold text-slate-300">
                    {index + 2}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {task.title}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {task.source}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState className="bg-slate-950/30">
                Nothing else needs attention right now.
              </EmptyState>
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader eyebrow="Money" title="Today's spending" />
          <h3 className="mt-2 text-2xl font-semibold text-white">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: snapshot.currency,
              maximumFractionDigits: 2,
            }).format(snapshot.todaysSpendingAmount)}
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            {snapshot.todaysSpendingCount > 0
              ? `${snapshot.todaysSpendingCount} transaction${snapshot.todaysSpendingCount === 1 ? '' : 's'} logged today.`
              : 'No spending logged for today yet.'}
          </p>

          <div className="mt-4 space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onNavigate(action.id)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-3 text-left transition hover:border-cyan-300/30 hover:bg-cyan-400/10"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] text-cyan-200">
                      <Icon size={18} />
                    </span>
                    <span className="text-sm font-medium text-white">{action.label}</span>
                  </span>
                  <ArrowRight size={16} className="text-slate-500" />
                </button>
              )
            })}
          </div>
        </Card>
      </section>
    </div>
  )
}

export default DashboardIntro
