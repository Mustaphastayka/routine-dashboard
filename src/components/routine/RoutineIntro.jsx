import { useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  Plus,
  SkipForward,
  Sparkles,
  Trash2,
} from 'lucide-react'
import Button from '../ui/Button.jsx'
import PageHero from '../ui/PageHero.jsx'
import Card from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import {
  addRoutineAddition,
  deleteRoutineAddition,
  moveRoutineTask,
  readRoutineState,
  setRoutineTaskStatus,
} from '../../lib/routines.js'

function getTaskToneClasses(status, isSuggested) {
  if (status === 'completed') {
    return 'border-cyan-300/30 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(34,211,238,0.08)]'
  }

  if (status === 'skipped') {
    return 'border-amber-300/25 bg-amber-400/10 opacity-90'
  }

  if (isSuggested) {
    return 'border-cyan-300/35 bg-cyan-400/[0.08] shadow-[0_0_0_1px_rgba(103,232,249,0.12)]'
  }

  return 'border-white/8 bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.05]'
}

function getTaskLabelClasses(status) {
  if (status === 'completed') {
    return 'text-cyan-50 line-through decoration-cyan-300/60'
  }

  if (status === 'skipped') {
    return 'text-slate-400 line-through decoration-slate-500/70'
  }

  return 'text-white'
}

function RoutineIntro() {
  const [routineState, setRoutineState] = useState(() => readRoutineState())
  const [additionLabel, setAdditionLabel] = useState('')
  const additionInputRef = useRef(null)

  const {
    todayKey = 'today',
    todaysAdditions = [],
    todaysTasks = [],
    completedCount = 0,
    skippedCount = 0,
    totalCount = 0,
    completionPercent = 0,
    nextSuggestedTask = null,
    previousTrackedDays = 0,
  } = routineState ?? {}

  const progressStyle = useMemo(
    () => ({
      background: `conic-gradient(rgba(34, 211, 238, 0.95) ${completionPercent}%, rgba(255, 255, 255, 0.08) ${completionPercent}% 100%)`,
    }),
    [completionPercent],
  )

  const handleTaskStatus = (task, status) => {
    setRoutineState(
      setRoutineTaskStatus({
        dateKey: todayKey,
        templateId: task.kind === 'template' ? task.templateId : undefined,
        stepId: task.kind === 'template' ? task.id : undefined,
        additionId: task.kind === 'addition' ? task.id : undefined,
        status,
      }),
    )
  }

  const handleAdditionSubmit = (event) => {
    event.preventDefault()

    if (!additionLabel.trim()) {
      return
    }

    setRoutineState(
      addRoutineAddition({
        dateKey: todayKey,
        label: additionLabel,
      }),
    )
    setAdditionLabel('')
  }

  const handleAdditionDelete = (additionId) => {
    setRoutineState(
      deleteRoutineAddition({
        dateKey: todayKey,
        additionId,
      }),
    )
  }

  const handleMoveTask = (taskKey, direction) => {
    setRoutineState(
      moveRoutineTask({
        dateKey: todayKey,
        taskKey,
        direction,
      }),
    )
  }

  const focusAdditionInput = () => {
    additionInputRef.current?.focus()
  }

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow="Today Focus"
        title="Your daily routine control panel"
        description={`Keep today simple: move through your checklist, capture one-off tasks, and save progress for ${todayKey} without changing your reusable template.`}
      />
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.8fr)]">
        <Card
          as="article"
          variant="hero"
          className="bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(15,23,42,0.65))] shadow-[0_20px_60px_rgba(15,23,42,0.4)]"
        >
          <SectionHeader
            eyebrow="Today's checklist"
            title={
              todaysTasks.length > 0
                ? 'Stay focused on what matters now'
                : 'Build your routine your way'
            }
            description={
              todaysTasks.length > 0
                ? "Template tasks and today's additions live together here so the day feels operational, not administrative."
                : 'Start with your own first routine task. Nothing is preloaded for new users, and your saved routines remain untouched.'
            }
            action={
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                <Sparkles size={18} />
              </div>
            }
          />

          <div className="mt-5 rounded-3xl border border-cyan-300/15 bg-cyan-400/[0.05] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
              Next suggested task
            </p>
            <div className="mt-2 flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-slate-950/70 text-cyan-200">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-white">
                  {nextSuggestedTask?.label ?? 'Everything for today is wrapped'}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {nextSuggestedTask
                    ? 'This is the first incomplete item in your current daily order.'
                    : 'No remaining incomplete tasks right now.'}
                </p>
              </div>
            </div>
          </div>

          <form className="mt-5 space-y-3" onSubmit={handleAdditionSubmit}>
            <div className="rounded-3xl border border-white/8 bg-slate-950/30 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">Quick add for today</p>
                  <p className="mt-1 text-sm text-slate-400">
                    One-off tasks stay in today&apos;s view only and never update your template.
                  </p>
                </div>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                  Today only
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="block flex-1">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Task name
                  </span>
                  <input
                    ref={additionInputRef}
                    type="text"
                    value={additionLabel}
                    onChange={(event) => setAdditionLabel(event.target.value)}
                    placeholder="A one-off task just for today..."
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </label>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={!additionLabel.trim()}
                >
                  <span className="flex items-center gap-2">
                    <Plus size={16} />
                    Add now
                  </span>
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5 space-y-3">
            {todaysTasks.length > 0 ? (
              todaysTasks.map((task, index) => {
                const isSuggested = nextSuggestedTask?.key === task.key
                const isAddition = task.kind === 'addition'

                return (
                  <article
                    key={task.key}
                    className={`rounded-2xl border px-4 py-4 transition ${getTaskToneClasses(
                      task.status,
                      isSuggested,
                    )}`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleTaskStatus(task, 'completed')}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-slate-950/80 text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-100"
                        aria-label={
                          task.status === 'completed'
                            ? 'Mark task incomplete'
                            : 'Mark task complete'
                        }
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 size={18} className="text-cyan-300" />
                        ) : (
                          <Circle size={18} />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/8 bg-slate-950/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            {task.metaLabel}
                          </span>
                          {isSuggested ? (
                            <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                              Up next
                            </span>
                          ) : null}
                          {task.status === 'completed' ? (
                            <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                              Completed
                            </span>
                          ) : null}
                          {task.status === 'skipped' ? (
                            <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-100">
                              Skipped
                            </span>
                          ) : null}
                        </div>
                        <p className={`mt-3 text-sm font-medium ${getTaskLabelClasses(task.status)}`}>
                          {task.label}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant={task.status === 'completed' ? 'ghost' : 'secondary'}
                        onClick={() => handleTaskStatus(task, 'completed')}
                        className="min-h-11"
                      >
                        <span className="flex items-center gap-2">
                          <CheckCircle2 size={16} />
                          {task.status === 'completed' ? 'Completed' : 'Complete'}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant={task.status === 'skipped' ? 'ghost' : 'secondary'}
                        onClick={() => handleTaskStatus(task, 'skipped')}
                        className="min-h-11"
                      >
                        <span className="flex items-center gap-2">
                          <SkipForward size={16} />
                          {task.status === 'skipped' ? 'Skipped' : 'Skip'}
                        </span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleMoveTask(task.key, 'up')}
                        disabled={index === 0}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-slate-950/70 text-slate-300 transition hover:border-white/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Move task up"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTask(task.key, 'down')}
                        disabled={index === todaysTasks.length - 1}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-slate-950/70 text-slate-300 transition hover:border-white/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Move task down"
                      >
                        <ArrowDown size={16} />
                      </button>
                      {isAddition ? (
                        <button
                          type="button"
                          onClick={() => handleAdditionDelete(task.id)}
                          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-slate-950/70 text-slate-400 transition hover:border-rose-300/30 hover:text-rose-200"
                          aria-label="Delete today's added task"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="space-y-3">
                <EmptyState>
                  No routine exists yet. Add your first routine task to start building a custom day.
                </EmptyState>
                <Button type="button" className="w-full sm:w-auto" onClick={focusAdditionInput}>
                  <span className="flex items-center gap-2">
                    <Plus size={16} />
                    Add first routine task
                  </span>
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Today's completion"
            title={`${completionPercent}% complete`}
            description="A fresh checklist is created each day, while previous dates stay saved in local storage."
          />
          <div className="mt-5 flex items-center gap-4">
            <div
              className="grid h-24 w-24 place-items-center rounded-full p-2"
              style={progressStyle}
              aria-hidden="true"
            >
              <div className="grid h-full w-full place-items-center rounded-full bg-slate-950 text-center">
                <span className="text-lg font-semibold text-white">
                  {completionPercent}%
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {completedCount} of {totalCount} complete
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Checked items are stored only for {todayKey}.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.06] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200/70">
                Completed tasks
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{completedCount}</p>
            </div>
            <div className="rounded-2xl border border-amber-300/15 bg-amber-400/[0.06] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100/80">
                Skipped tasks
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{skippedCount}</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="h-3 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-cyan-300 transition-[width]"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-400">
              {previousTrackedDays > 0
                ? `${previousTrackedDays} previous day${previousTrackedDays === 1 ? '' : 's'} saved. Today's checklist resets naturally without changing your template.`
                : 'Tomorrow starts fresh automatically, while your template stays unchanged.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-cyan-100">
                Completed counts toward progress
              </span>
              <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2.5 py-1 text-amber-100">
                Skipped stays neutral
              </span>
              {todaysAdditions.length > 0 ? (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-slate-300">
                  {todaysAdditions.length} today-only task{todaysAdditions.length === 1 ? '' : 's'}
                </span>
              ) : null}
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}

export default RoutineIntro
