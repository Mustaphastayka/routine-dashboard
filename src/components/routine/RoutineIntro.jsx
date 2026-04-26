import { useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  Clock3,
  MoreVertical,
  Pencil,
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
  addRoutineTaskForDate,
  addRoutineTemplateTask,
  deleteRoutineAddition,
  deleteRoutineTaskForDate,
  deleteRoutineTemplateTask,
  moveRoutineTask,
  moveRoutineTaskForDate,
  moveRoutineTemplateTask,
  readRoutineState,
  setRoutineTaskStatus,
  updateRoutineTaskForDate,
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

  const [tomorrowForm, setTomorrowForm] = useState(() => createRoutineFormState())
  const [editingTomorrowStepId, setEditingTomorrowStepId] = useState(null)
  const [activeTomorrowMenuId, setActiveTomorrowMenuId] = useState(null)
  const tomorrowInputRef = useRef(null)

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

  const todayOnlyTasks = todaysTasks.filter((task) => task.kind === 'addition')

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
      if (routineState.hasDateSpecificToday) {
        setRoutineState(
          updateRoutineTaskForDate({
            dateKey: routineState.todayKey,
            stepId: editingStepId,
            label: routineForm.label,
            timeLabel: routineForm.timeLabel,
          }),
        )
      } else {
        setRoutineState(
          updateRoutineTemplateTask({
            stepId: editingStepId,
            label: routineForm.label,
            timeLabel: routineForm.timeLabel,
          }),
        )
      }
    } else if (routineState.hasDateSpecificToday) {
      setRoutineState(
        addRoutineTaskForDate({
          dateKey: routineState.todayKey,
          label: routineForm.label,
          timeLabel: routineForm.timeLabel,
          fallbackSteps: routineState.routineSteps,
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

  const handleTomorrowSubmit = (event) => {
    event.preventDefault()

    if (!tomorrowForm.label.trim()) {
      return
    }

    if (editingTomorrowStepId) {
      setRoutineState(
        updateRoutineTaskForDate({
          dateKey: routineState.tomorrowKey,
          stepId: editingTomorrowStepId,
          label: tomorrowForm.label,
          timeLabel: tomorrowForm.timeLabel,
        }),
      )
    } else {
      setRoutineState(
        addRoutineTaskForDate({
          dateKey: routineState.tomorrowKey,
          label: tomorrowForm.label,
          timeLabel: tomorrowForm.timeLabel,
          fallbackSteps: routineState.tomorrowSteps ?? [],
        }),
      )
    }

    resetTomorrowForm()
  }

  const resetTomorrowForm = () => {
    setTomorrowForm(createRoutineFormState())
    setEditingTomorrowStepId(null)
  }

  const handleEditTomorrowStep = (step) => {
    setEditingTomorrowStepId(step.id)
    setTomorrowForm({
      label: step.label,
      timeLabel: step.timeLabel ?? '',
    })
    tomorrowInputRef.current?.focus()
  }

  const handleDeleteTomorrowStep = (stepId) => {
    setRoutineState(deleteRoutineTaskForDate({ dateKey: routineState.tomorrowKey, stepId }))
  }

  const handleMoveTomorrowStep = (stepId, direction) => {
    setRoutineState(
      moveRoutineTaskForDate({ dateKey: routineState.tomorrowKey, stepId, direction }),
    )
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
    if (routineState.hasDateSpecificToday) {
      setRoutineState(deleteRoutineTaskForDate({ dateKey: routineState.todayKey, stepId }))
    } else {
      setRoutineState(deleteRoutineTemplateTask({ stepId }))
    }

    if (editingStepId === stepId) {
      resetRoutineForm()
    }
  }

  const handleMoveRoutineStep = (stepId, direction) => {
    if (routineState.hasDateSpecificToday) {
      setRoutineState(moveRoutineTaskForDate({ dateKey: routineState.todayKey, stepId, direction }))
    } else {
      setRoutineState(moveRoutineTemplateTask({ stepId, direction }))
    }
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

  const focusTomorrowInput = () => {
    tomorrowInputRef.current?.focus()
  }

  const focusAdditionInput = () => {
    additionInputRef.current?.focus()
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 md:gap-6">
      <PageHero
        eyebrow="Routine"
        title="Run your day with clarity"
        description="Work from today's routine, prepare tomorrow, and keep your reusable template in the background."
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.8fr)]">
        <Card
          as="article"
          variant="hero"
          className="bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(15,23,42,0.65))] shadow-[0_20px_60px_rgba(15,23,42,0.4)]"
        >
          <SectionHeader
            eyebrow="Today's Routine"
            title="Today's Routine"
            description="This is the list to work from during the day, including your base routine and any today-only extras."
            action={
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                <Sparkles size={18} />
              </div>
            }
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
                  {totalCount === 0
                    ? 'No routine set for today'
                    : nextSuggestedTask?.label ?? 'Everything is done'}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {totalCount === 0
                    ? 'Nothing is scheduled for today, so progress stays neutral.'
                    : nextSuggestedTask
                      ? 'This is the next task.'
                      : 'You have no more tasks.'}
                </p>
              </div>
            </div>
          </div>

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
                          <p
                            className={`text-[15px] font-semibold leading-tight ${getTaskLabelClasses(task.status)}`}
                          >
                            {task.label}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {isSuggested && task.status === 'incomplete' ? (
                              <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                                Up next
                              </span>
                            ) : null}
                            {isAddition ? (
                              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                Today only
                              </span>
                            ) : null}
                            {task.timeLabel ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                <Clock3 size={12} />
                                {task.timeLabel}
                              </span>
                            ) : null}
                            {task.status === 'skipped' ? (
                              <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                                Skipped
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === task.key ? null : task.key)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-white"
                        >
                          <MoreVertical size={20} />
                        </button>

                        {activeMenuId === task.key ? (
                          <div className="absolute right-0 top-12 z-20 w-48 rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
                            {isAddition ? (
                              <>
                                <button
                                  onClick={() => {
                                    handleMoveTask(task.key, 'up')
                                    setActiveMenuId(null)
                                  }}
                                  disabled={index === 0}
                                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30"
                                >
                                  <ArrowUp size={16} /> Move Up
                                </button>
                                <button
                                  onClick={() => {
                                    handleMoveTask(task.key, 'down')
                                    setActiveMenuId(null)
                                  }}
                                  disabled={index === todaysTasks.length - 1}
                                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30"
                                >
                                  <ArrowDown size={16} /> Move Down
                                </button>
                                <div className="my-1 border-t border-white/5" />
                                <button
                                  onClick={() => {
                                    handleAdditionDelete(task.id)
                                    setActiveMenuId(null)
                                  }}
                                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10"
                                >
                                  <Trash2 size={16} /> Delete
                                </button>
                              </>
                            ) : (
                              <p className="px-3 py-2 text-xs text-slate-500 italic">
                                Edit this in the routine template section below
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>

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
              <EmptyState action={{ label: 'Add today-only task', onClick: focusAdditionInput }}>
                Nothing is scheduled for today yet.
              </EmptyState>
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Today"
            title={totalCount > 0 ? `${completionPercent}% complete` : 'No routine set for today'}
            description={totalCount > 0 ? 'Track progress while you move through today.' : 'Nothing is scheduled, so today stays neutral.'}
          />
          <div className="mt-5 flex items-center gap-4">
            <div
              className={`grid h-24 w-24 place-items-center rounded-full p-2 ${totalCount === 0 ? 'opacity-30 grayscale' : ''}`}
              style={totalCount > 0 ? progressStyle : { background: 'rgba(255,255,255,0.05)' }}
              aria-hidden="true"
            >
              <div className="grid h-full w-full place-items-center rounded-full bg-slate-950 text-center">
                <span className="text-lg font-semibold text-white">
                  {totalCount > 0 ? `${completionPercent}%` : '-'}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {totalCount > 0 ? `${completedCount} of ${totalCount} done` : 'No progress to track'}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Progress is saved only for {todayKey}.
              </p>
            </div>
          </div>

          {totalCount > 0 ? (
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
          ) : null}

          <div className="mt-5">
            {totalCount > 0 ? (
              <div className="h-3 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-cyan-300 transition-[width]"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            ) : null}
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

      <section className="grid gap-4 lg:grid-cols-2">
        <Card
          as="article"
          variant="hero"
          className="bg-[linear-gradient(180deg,rgba(15,23,42,0.6),rgba(15,23,42,0.4))] border-cyan-500/10 shadow-lg"
        >
          <SectionHeader
            eyebrow="Tomorrow's Routine"
            title="Tomorrow's Routine"
            description={routineState.tomorrowDateFormatted}
            action={
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/5 text-cyan-200/50">
                <Sparkles size={18} />
              </div>
            }
          />

          <form className="mt-5 space-y-4" onSubmit={handleTomorrowSubmit}>
            <div className="rounded-3xl border border-white/8 bg-slate-950/30 px-4 py-4">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Task title
                  </span>
                  <input
                    ref={tomorrowInputRef}
                    type="text"
                    value={tomorrowForm.label}
                    onChange={(event) =>
                      setTomorrowForm((f) => ({ ...f, label: event.target.value }))
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
                    value={tomorrowForm.timeLabel}
                    onChange={(event) =>
                      setTomorrowForm((f) => ({ ...f, timeLabel: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button type="submit" className="flex-1">
                  <span className="flex items-center justify-center gap-2">
                    <Plus size={16} />
                    {editingTomorrowStepId ? 'Save task' : 'Add task for tomorrow'}
                  </span>
                </Button>
                {editingTomorrowStepId ? (
                  <Button type="button" variant="secondary" onClick={resetTomorrowForm}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </div>
          </form>

          <div className="mt-5 space-y-3">
            {routineState.tomorrowSteps && routineState.tomorrowSteps.length > 0 ? (
              routineState.tomorrowSteps.map((step, index) => (
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
                        {step.timeLabel ? (
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <Clock3 size={12} />
                            {step.timeLabel}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveTomorrowMenuId(
                            activeTomorrowMenuId === `step-${step.id}` ? null : `step-${step.id}`,
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-white"
                      >
                        <MoreVertical size={20} />
                      </button>

                      {activeTomorrowMenuId === `step-${step.id}` ? (
                        <div className="absolute right-0 top-12 z-20 w-48 rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
                          <button
                            onClick={() => {
                              handleEditTomorrowStep(step)
                              setActiveTomorrowMenuId(null)
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5"
                          >
                            <Pencil size={16} /> Edit Task
                          </button>
                          <div className="my-1 border-t border-white/5" />
                          <button
                            onClick={() => {
                              handleMoveTomorrowStep(step.id, 'up')
                              setActiveTomorrowMenuId(null)
                            }}
                            disabled={index === 0}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30"
                          >
                            <ArrowUp size={16} /> Move Up
                          </button>
                          <button
                            onClick={() => {
                              handleMoveTomorrowStep(step.id, 'down')
                              setActiveTomorrowMenuId(null)
                            }}
                            disabled={index === routineState.tomorrowSteps.length - 1}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30"
                          >
                            <ArrowDown size={16} /> Move Down
                          </button>
                          <div className="my-1 border-t border-white/5" />
                          <button
                            onClick={() => {
                              handleDeleteTomorrowStep(step.id)
                              setActiveTomorrowMenuId(null)
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState action={{ label: "Add tomorrow's first task", onClick: focusTomorrowInput }}>
                Tomorrow's routine is not prepared yet.
              </EmptyState>
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Today-only Extras"
            title="Today-only Extras"
            description="Add one-off tasks here. They will appear in Today's Routine so you can complete them with everything else."
          />

          <form className="mt-5 space-y-3" onSubmit={handleAdditionSubmit}>
            <div className="rounded-3xl border border-white/8 bg-slate-950/30 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">Add something for today</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Use this for errands, calls, pickups, or anything that only matters today.
                  </p>
                </div>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                  {todayOnlyTasks.length} extra{todayOnlyTasks.length === 1 ? '' : 's'}
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
            {todayOnlyTasks.length > 0 ? (
              todayOnlyTasks.map((task) => {
                const taskIndex = todaysTasks.findIndex((currentTask) => currentTask.key === task.key)

                return (
                  <article
                    key={task.key}
                    className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-white">{task.label}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                            Shows in Today's Routine
                          </span>
                          {task.status === 'completed' ? (
                            <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                              Completed
                            </span>
                          ) : task.status === 'skipped' ? (
                            <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                              Skipped
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMoveTask(task.key, 'up')}
                          disabled={taskIndex <= 0}
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-white disabled:opacity-30"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTask(task.key, 'down')}
                          disabled={taskIndex === -1 || taskIndex >= todaysTasks.length - 1}
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-white disabled:opacity-30"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdditionDelete(task.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              <EmptyState action={{ label: 'Add extra task', onClick: focusAdditionInput }}>
                No today-only extras yet.
              </EmptyState>
            )}
          </div>
        </Card>
      </section>

      <section>
        <Card className="border-white/5 bg-white/[0.02]">
          <SectionHeader
            eyebrow="Routine Template"
            title={selectedRoutineName || 'Routine Template'}
            description="Your reusable base routine. Keep this updated when the default shape of your day changes."
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
                        {step.timeLabel ? (
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <Clock3 size={12} />
                            {step.timeLabel}
                          </p>
                        ) : null}
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

                      {activeMenuId === `step-${step.id}` ? (
                        <div className="absolute right-0 top-12 z-20 w-48 rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
                          <button
                            onClick={() => {
                              handleEditRoutineStep(step)
                              setActiveMenuId(null)
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5"
                          >
                            <Pencil size={16} /> Edit Task
                          </button>
                          <div className="my-1 border-t border-white/5" />
                          <button
                            onClick={() => {
                              handleMoveRoutineStep(step.id, 'up')
                              setActiveMenuId(null)
                            }}
                            disabled={index === 0}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30"
                          >
                            <ArrowUp size={16} /> Move Up
                          </button>
                          <button
                            onClick={() => {
                              handleMoveRoutineStep(step.id, 'down')
                              setActiveMenuId(null)
                            }}
                            disabled={index === routineSteps.length - 1}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30"
                          >
                            <ArrowDown size={16} /> Move Down
                          </button>
                          <div className="my-1 border-t border-white/5" />
                          <button
                            onClick={() => {
                              handleDeleteRoutineStep(step.id)
                              setActiveMenuId(null)
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState action={{ label: 'Add template task', onClick: focusRoutineInput }}>
                Your routine template is empty.
              </EmptyState>
            )}
          </div>
        </Card>
      </section>
    </div>
  )
}

export default RoutineIntro
