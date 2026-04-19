import { useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  Clock3,
  Pencil,
  Plus,
  SkipForward,
  Sparkles,
  Trash2,
  MoreVertical,
} from 'lucide-react'
import Button from '../ui/Button.jsx'
import PageHero from '../ui/PageHero.jsx'
import Card from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import {
  addRoutineAddition,
  addRoutineTemplateTask,
  deleteRoutineAddition,
  deleteRoutineTemplateTask,
  moveRoutineTask,
  moveRoutineTemplateTask,
  readRoutineState,
  setRoutineTaskStatus,
  updateRoutineTemplateTask,
} from '../../lib/routines.js'

function createRoutineFormState() {
  return {
    label: '',
    timeLabel: '',
  }
}

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
  const [routineForm, setRoutineForm] = useState(() => createRoutineFormState())
  const [additionLabel, setAdditionLabel] = useState('')
  const [editingStepId, setEditingStepId] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)
  const routineInputRef = useRef(null)
  const additionInputRef = useRef(null)

  const {
    selectedRoutineName = '',
    routineSteps = [],
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

  const handleRoutineFormValue = (field, value) => {
    setRoutineForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const resetRoutineForm = () => {
    setRoutineForm(createRoutineFormState())
    setEditingStepId(null)
  }

  const handleRoutineSubmit = (event) => {
    event.preventDefault()

    if (!routineForm.label.trim()) {
      return
    }

    if (editingStepId) {
      setRoutineState(
        updateRoutineTemplateTask({
          stepId: editingStepId,
          label: routineForm.label,
          timeLabel: routineForm.timeLabel,
        }),
      )
    } else {
      setRoutineState(
        addRoutineTemplateTask({
          label: routineForm.label,
          timeLabel: routineForm.timeLabel,
        }),
      )
    }

    resetRoutineForm()
  }

  const handleEditRoutineStep = (step) => {
    setEditingStepId(step.id)
    setRoutineForm({
      label: step.label,
      timeLabel: step.timeLabel ?? '',
    })
    routineInputRef.current?.focus()
  }

  const handleDeleteRoutineStep = (stepId) => {
    setRoutineState(deleteRoutineTemplateTask({ stepId }))

    if (editingStepId === stepId) {
      resetRoutineForm()
    }
  }

  const handleMoveRoutineStep = (stepId, direction) => {
    setRoutineState(moveRoutineTemplateTask({ stepId, direction }))
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

  const focusRoutineInput = () => {
    routineInputRef.current?.focus()
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 md:gap-6">
      <PageHero
        eyebrow="Routine"
        title="Create your daily routine"
        description="Add recurring tasks and check off what you do every day."
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.8fr)]">
        <Card
          as="article"
          variant="hero"
          className="bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(15,23,42,0.65))] shadow-[0_20px_60px_rgba(15,23,42,0.4)]"
        >
          <SectionHeader
            eyebrow="Your routine"
            title={selectedRoutineName || 'Your routine'}
            description="Add tasks and order them as you like."
            action={
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                <Sparkles size={18} />
              </div>
            }
          />

          <form className="mt-5 space-y-4" onSubmit={handleRoutineSubmit}>
            <div className="rounded-3xl border border-white/8 bg-slate-950/30 px-4 py-4">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Task title
                  </span>
                  <input
                    ref={routineInputRef}
                    type="text"
                    value={routineForm.label}
                    onChange={(event) =>
                      handleRoutineFormValue('label', event.target.value)
                    }
                    placeholder="Morning walk, read, school run..."
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Time (optional)
                  </span>
                  <input
                    type="time"
                    value={routineForm.timeLabel}
                    onChange={(event) =>
                      handleRoutineFormValue('timeLabel', event.target.value)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button type="submit" className="flex-1">
                  <span className="flex items-center justify-center gap-2">
                    <Plus size={16} />
                    {editingStepId ? 'Save routine task' : 'Add routine task'}
                  </span>
                </Button>
                {editingStepId ? (
                  <Button type="button" variant="secondary" onClick={resetRoutineForm}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </div>
          </form>

          <div className="mt-5 space-y-3">
            {routineSteps.length > 0 ? (
              routineSteps.map((step, index) => (
                <article
                  key={step.id}
                  className="relative rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-4 transition-all hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-950/50 text-[13px] font-bold text-slate-400">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-white">{step.label}</p>
                        {step.timeLabel && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <Clock3 size={12} />
                            {step.timeLabel}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === `step-${step.id}` ? null : `step-${step.id}`)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-white"
                      >
                        <MoreVertical size={20} />
                      </button>

                      {activeMenuId === `step-${step.id}` && (
                        <div className="absolute right-0 top-12 z-20 w-48 rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
                          <button
                            onClick={() => { handleEditRoutineStep(step); setActiveMenuId(null); }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5"
                          >
                            <Pencil size={16} /> Edit Task
                          </button>
                          <div className="my-1 border-t border-white/5" />
                          <button
                            onClick={() => { handleMoveRoutineStep(step.id, 'up'); setActiveMenuId(null); }}
                            disabled={index === 0}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30"
                          >
                            <ArrowUp size={16} /> Move Up
                          </button>
                          <button
                            onClick={() => { handleMoveRoutineStep(step.id, 'down'); setActiveMenuId(null); }}
                            disabled={index === routineSteps.length - 1}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30"
                          >
                            <ArrowDown size={16} /> Move Down
                          </button>
                          <div className="my-1 border-t border-white/5" />
                          <button
                            onClick={() => { handleDeleteRoutineStep(step.id); setActiveMenuId(null); }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                action={{ label: 'Add first task', onClick: focusRoutineInput }}
              >
                Your routine is empty. Add your first task.
              </EmptyState>
            )}
          </div>

          <div className="mt-6 border-t border-white/8 pt-6">
            <SectionHeader
              eyebrow="Today"
              title="Today's tasks"
              description="Your routine plus any extras for today."
            />

            <div className="mt-5 rounded-3xl border border-cyan-300/15 bg-cyan-400/[0.05] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                Next up
              </p>
              <div className="mt-2 flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-slate-950/70 text-cyan-200">
                  <Sparkles size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-white">
                    {nextSuggestedTask?.label ?? 'Everything is done'}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {nextSuggestedTask
                      ? 'This is the next task.'
                      : 'You have no more tasks.'}
                  </p>
                </div>
              </div>
            </div>

            <form className="mt-5 space-y-3" onSubmit={handleAdditionSubmit}>
              <div className="rounded-3xl border border-white/8 bg-slate-950/30 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">Add something for today</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Add a task that only needs to happen today.
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
                      placeholder="Pickup, call, errand..."
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
                      Add for today
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
                      className={`relative flex flex-col gap-4 rounded-3xl border p-4 transition-all duration-300 ${getTaskToneClasses(
                        task.status,
                        isSuggested,
                      )}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleTaskStatus(task, 'completed')}
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all ${
                              task.status === 'completed'
                                ? 'border-cyan-300 bg-cyan-400 text-slate-950'
                                : 'border-white/10 bg-slate-950/50 text-slate-400 hover:border-cyan-500/50'
                            }`}
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle2 size={22} strokeWidth={2.5} />
                            ) : (
                              <Circle size={22} />
                            )}
                          </button>

                          <div className="min-w-0 flex-1 pt-1">
                            <p className={`text-[15px] font-semibold leading-tight ${getTaskLabelClasses(task.status)}`}>
                              {task.label}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {isSuggested && task.status === 'incomplete' && (
                                <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                                  Up next
                                </span>
                              )}
                              {task.timeLabel && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                  <Clock3 size={12} />
                                  {task.timeLabel}
                                </span>
                              )}
                              {task.status === 'skipped' && (
                                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                                  Skipped
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Dropdown Menu Toggle */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === task.key ? null : task.key)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-white"
                          >
                            <MoreVertical size={20} />
                          </button>

                          {activeMenuId === task.key && (
                            <div className="absolute right-0 top-12 z-20 w-48 rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
                              {isAddition ? (
                                <>
                                  <button
                                    onClick={() => { handleMoveTask(task.key, 'up'); setActiveMenuId(null); }}
                                    disabled={index === 0}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30"
                                  >
                                    <ArrowUp size={16} /> Move Up
                                  </button>
                                  <button
                                    onClick={() => { handleMoveTask(task.key, 'down'); setActiveMenuId(null); }}
                                    disabled={index === todaysTasks.length - 1}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30"
                                  >
                                    <ArrowDown size={16} /> Move Down
                                  </button>
                                  <div className="my-1 border-t border-white/5" />
                                  <button
                                    onClick={() => { handleAdditionDelete(task.id); setActiveMenuId(null); }}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10"
                                  >
                                    <Trash2 size={16} /> Delete
                                  </button>
                                </>
                              ) : (
                                <p className="px-3 py-2 text-xs text-slate-500 italic">
                                  Edit this in the routine section above
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Primary Actions: Complete & Skip */}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={task.status === 'completed' ? 'primary' : 'secondary'}
                          onClick={() => handleTaskStatus(task, 'completed')}
                          className="flex-1 h-12 rounded-2xl"
                        >
                          <span className="flex items-center gap-2">
                            <CheckCircle2 size={18} />
                            {task.status === 'completed' ? 'Undo' : 'Complete'}
                          </span>
                        </Button>
                        <Button
                          type="button"
                          variant={task.status === 'skipped' ? 'primary' : 'secondary'}
                          onClick={() => handleTaskStatus(task, 'skipped')}
                          className={`flex-1 h-12 rounded-2xl ${task.status === 'skipped' ? 'bg-amber-500 hover:bg-amber-400' : ''}`}
                        >
                          <span className="flex items-center gap-2">
                            <SkipForward size={18} />
                            {task.status === 'skipped' ? 'Undo' : 'Skip'}
                          </span>
                        </Button>
                      </div>
                    </article>
                  )
                })
              ) : (
                <EmptyState
                  action={{ label: 'Add first task', onClick: focusRoutineInput }}
                >
                  Nothing is in your routine yet. Add your first task.
                </EmptyState>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Today"
            title={`${completionPercent}% complete`}
            description="Your daily progress resets every day."
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
                {completedCount} of {totalCount} done
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Progress is saved only for {todayKey}.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.06] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200/70">
                Completed
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{completedCount}</p>
            </div>
            <div className="rounded-2xl border border-amber-300/15 bg-amber-400/[0.06] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100/80">
                Skipped
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
                ? `${previousTrackedDays} earlier day${previousTrackedDays === 1 ? '' : 's'} saved.`
                : 'Each day starts fresh.'}
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
