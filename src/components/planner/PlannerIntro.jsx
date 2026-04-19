import { useMemo, useState } from 'react'
import { Check, Clock3, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import PageHero from '../ui/PageHero.jsx'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import { getLocalDateKey } from '../../lib/dataUtils.js'
import {
  addPlannerTask,
  addPlannerTaskProgress,
  deletePlannerTask,
  plannerSections,
  readPlannerState,
  todayMissionLimit,
  togglePlannerTask,
  updatePlannerTask,
} from '../../lib/planner.js'

const statusFilters = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'completed', label: 'Completed' },
]

function getDateWithOffset(offsetDays) {
  const nextDate = new Date()
  nextDate.setHours(0, 0, 0, 0)
  nextDate.setDate(nextDate.getDate() + offsetDays)

  return getLocalDateKey(nextDate)
}

function getDefaultDueDate(sectionId) {
  if (sectionId === 'today') {
    return getDateWithOffset(0)
  }

  if (sectionId === 'thisWeek') {
    return getDateWithOffset(4)
  }

  if (sectionId === 'thisMonth') {
    return getDateWithOffset(10)
  }

  return getDateWithOffset(0)
}

function createInitialTaskForm(sectionId = 'today') {
  return {
    title: '',
    priority: 'medium',
    dueDate: getDefaultDueDate(sectionId),
    targetDuration: 60,
    progressMinutes: 0,
    completed: false,
    sectionId,
  }
}

function PlannerTaskCard({
  task,
  sectionId,
  sectionLabel,
  onToggle,
  onEdit,
  onDelete,
  onAddTime,
  highlight = false,
  nextFocus = false,
}) {
  const targetDuration = Math.max(0, Number(task.targetDuration) || 0)
  const progressMinutes = Math.max(0, Number(task.progressMinutes) || 0)
  const progressPercent =
    targetDuration > 0
      ? Math.min(100, Math.round((progressMinutes / targetDuration) * 100))
      : 0
  const quickAddOptions = [15, 30, 60]

  return (
    <article
      className={`rounded-2xl border px-4 py-4 transition ${
        nextFocus
          ? task.completed
            ? 'border-cyan-300/25 bg-[linear-gradient(180deg,rgba(34,211,238,0.14),rgba(15,23,42,0.8))] opacity-85'
            : 'border-cyan-200/40 bg-[linear-gradient(180deg,rgba(34,211,238,0.22),rgba(15,23,42,0.95))] shadow-[0_24px_55px_rgba(34,211,238,0.18)]'
          : highlight
            ? task.completed
              ? 'border-cyan-300/25 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(15,23,42,0.76))] opacity-80'
              : 'border-cyan-300/30 bg-[linear-gradient(180deg,rgba(8,145,178,0.2),rgba(15,23,42,0.92))] shadow-[0_20px_45px_rgba(8,145,178,0.16)]'
            : task.completed
              ? 'border-cyan-300/20 bg-cyan-400/8 opacity-75'
              : 'border-white/8 bg-white/[0.03]'
      }`}
    >
      <div className="flex items-start gap-3">
        <label
          className={`mt-0.5 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition ${
            task.completed
              ? 'border-cyan-300/30 bg-cyan-300 text-slate-950'
              : 'border-white/10 bg-slate-950/70 text-slate-400 hover:border-cyan-300/30 hover:text-cyan-200'
          }`}
          aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
        >
          <input
            type="checkbox"
            className="sr-only"
            checked={task.completed}
            onChange={() => onToggle(sectionId, task.id)}
          />
          <Check size={16} />
        </label>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h5
                className={`text-sm font-medium sm:text-[15px] ${
                  task.completed ? 'text-slate-400 line-through' : 'text-white'
                }`}
              >
                {task.title}
              </h5>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  {sectionLabel}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                  {task.priority}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-400">
                  {task.dueDate || 'No due date'}
                </span>
                <span className="rounded-full border border-cyan-300/15 bg-cyan-400/[0.08] px-2.5 py-1 text-[11px] font-medium text-cyan-100">
                  {progressMinutes} / {targetDuration} min
                </span>
                {nextFocus ? (
                  <span className="rounded-full border border-cyan-200/30 bg-cyan-300/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-50">
                    Next Focus
                  </span>
                ) : null}
                {highlight ? (
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                    Mission
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(sectionId, task)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-200"
                aria-label="Edit task"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(sectionId, task.id)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-rose-300/30 hover:text-rose-200"
                aria-label="Delete task"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Clock3 size={13} />
            Time progress
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-cyan-300 transition-[width]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickAddOptions.map((minutes) => (
          <Button
            key={minutes}
            type="button"
            variant="secondary"
            onClick={() => onAddTime(sectionId, task.id, minutes)}
            className="min-h-11 min-w-[5.25rem] px-4"
            disabled={task.completed}
          >
            +{minutes} min
          </Button>
        ))}
        {task.completed ? (
          <span className="inline-flex min-h-10 items-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-3 text-xs font-medium uppercase tracking-[0.14em] text-cyan-100">
            Target reached
          </span>
        ) : (
          <span className="inline-flex min-h-10 items-center rounded-2xl border border-white/10 bg-white/[0.03] px-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            Auto-completes at target
          </span>
        )}
      </div>
    </article>
  )
}

function PlannerIntro() {
  const [plannerState, setPlannerState] = useState(() => readPlannerState())
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingTask, setEditingTask] = useState(null)
  const [taskForm, setTaskForm] = useState(() => createInitialTaskForm())

  const updateFormValue = (field, value) => {
    setTaskForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const updateSection = (sectionId) => {
    setTaskForm((currentForm) => ({
      ...currentForm,
      sectionId,
      dueDate: getDefaultDueDate(sectionId),
    }))
  }

  const resetForm = () => {
    setTaskForm(createInitialTaskForm())
    setEditingTask(null)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!taskForm.title.trim()) {
      return
    }

    if (editingTask) {
      setPlannerState(
        updatePlannerTask(editingTask.sectionId, editingTask.taskId, {
          title: taskForm.title,
          priority: taskForm.priority,
          dueDate: taskForm.dueDate,
          targetDuration: taskForm.targetDuration,
          progressMinutes: taskForm.progressMinutes,
          completed: taskForm.completed,
        }),
      )
    } else {
      setPlannerState(
        addPlannerTask(taskForm.sectionId, {
          title: taskForm.title,
          priority: taskForm.priority,
          dueDate: taskForm.dueDate,
          targetDuration: taskForm.targetDuration,
          progressMinutes: 0,
          completed: false,
        }),
      )
    }

    resetForm()
  }

  const handleEdit = (sectionId, task) => {
    setEditingTask({ sectionId, taskId: task.id })
    setTaskForm({
      title: task.title,
      priority: task.priority,
      dueDate: task.dueDate,
      targetDuration: task.targetDuration,
      progressMinutes: task.progressMinutes,
      completed: task.completed,
      sectionId,
    })
  }

  const handleDelete = (sectionId, taskId) => {
    setPlannerState(deletePlannerTask(sectionId, taskId))

    if (editingTask?.taskId === taskId) {
      resetForm()
    }
  }

  const handleToggle = (sectionId, taskId) => {
    setPlannerState(togglePlannerTask(sectionId, taskId))
  }

  const handleAddTime = (sectionId, taskId, minutes) => {
    setPlannerState(addPlannerTaskProgress(sectionId, taskId, minutes))
  }

  const filteredTasksBySection = useMemo(
    () =>
      plannerSections.reduce((result, section) => {
        result[section.id] = plannerState[section.id].filter((task) => {
          if (statusFilter === 'open') {
            return !task.completed
          }

          if (statusFilter === 'completed') {
            return task.completed
          }

          return true
        })
        return result
      }, {}),
    [plannerState, statusFilter],
  )

  const hasAnyTasks = plannerSections.some(
    (section) => (plannerState?.[section.id] ?? []).length > 0,
  )
  const nextFocusMission = plannerState.today.find((task) => !task.completed) ?? null
  const unifiedTasks = plannerSections.flatMap((section) =>
    filteredTasksBySection[section.id].map((task) => ({
      ...task,
      sectionId: section.id,
      sectionLabel: section.label,
      isTodayMission: section.id === 'today',
    })),
  )
  const missionsRemaining = Math.max(0, todayMissionLimit - plannerState.today.length)
  const isTodaySectionFull =
    !editingTask && taskForm.sectionId === 'today' && plannerState.today.length >= todayMissionLimit

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:gap-5">
      <PageHero
        eyebrow="Planner"
        title="Plan around the few things that matter most"
        description={`Choose up to ${todayMissionLimit} focused missions for today, then keep every task visible in one simple list.`}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:items-start">
        <Card
          as="article"
          variant="hero"
          className="mx-auto w-full max-w-3xl xl:sticky xl:top-36 xl:max-w-none"
        >
          <SectionHeader
            eyebrow={editingTask ? 'Edit task' : 'Add task'}
            title={editingTask ? 'Update planner task' : 'Create a new task'}
            action={
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                <Plus size={18} />
              </div>
            }
          />

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Title
              </span>
              <input
                type="text"
                value={taskForm.title}
                onChange={(event) => updateFormValue('title', event.target.value)}
                placeholder="Plan workout, review budget, finish report..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Section
                </span>
                <select
                  value={taskForm.sectionId}
                  onChange={(event) => updateSection(event.target.value)}
                  disabled={Boolean(editingTask)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
                >
                  {plannerSections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Priority
                </span>
                <select
                  value={taskForm.priority}
                  onChange={(event) => updateFormValue('priority', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Due date
              </span>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(event) => updateFormValue('dueDate', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Target duration (min)
                </span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={taskForm.targetDuration}
                  onChange={(event) => updateFormValue('targetDuration', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>

              {editingTask ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Current progress (min)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={taskForm.progressMinutes}
                    onChange={(event) => updateFormValue('progressMinutes', event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </label>
              ) : (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-sm font-medium text-slate-200">Progress starts at 0 min</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Add time from the task card with quick `+15`, `+30`, or `+60` buttons.
                  </p>
                </div>
              )}
            </div>

            {editingTask ? (
              <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={taskForm.completed}
                  onChange={(event) => updateFormValue('completed', event.target.checked)}
                  className="h-4 w-4 rounded border-white/15 bg-slate-950/80 text-cyan-300 focus:ring-cyan-400/30"
                />
                Mark task as completed
              </label>
            ) : null}

            {taskForm.sectionId === 'today' ? (
              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.06] px-4 py-3 text-sm text-slate-300">
                <p className="font-medium text-white">Today's Missions</p>
                <p className="mt-1 text-slate-400">
                  Reserve this space for your most important work. You can keep up to {todayMissionLimit} missions here.
                </p>
                <p className="mt-2 text-cyan-100">
                  {missionsRemaining > 0 || editingTask
                    ? `${missionsRemaining} mission slot${missionsRemaining === 1 ? '' : 's'} remaining.`
                    : 'Mission limit reached for today.'}
                </p>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" className="flex-1" disabled={isTodaySectionFull}>
                {editingTask ? 'Save changes' : 'Add task'}
              </Button>
              {editingTask ? (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card className="mx-auto w-full max-w-5xl xl:max-w-none">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeader
                eyebrow="Planner list"
                title="All tasks in one view"
                description="Scan every task in a single list without jumping between separate columns."
              />

              <div className="inline-flex rounded-2xl border border-white/8 bg-slate-950/60 p-1">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setStatusFilter(filter.id)}
                    className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                      statusFilter === filter.id
                        ? 'bg-cyan-300 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.06] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200/70">
                  Mission slots used
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {plannerState.today.length} / {todayMissionLimit}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Open missions
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {plannerState.today.filter((task) => !task.completed).length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Total visible
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {unifiedTasks.length}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(15,23,42,0.88))] p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                    Next Focus
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {nextFocusMission?.title ?? 'All missions are complete'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {nextFocusMission
                      ? 'This is the first incomplete mission in your list and the best place to put attention next.'
                      : 'There are no remaining incomplete missions for today right now.'}
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
                  <Sparkles size={18} />
                </div>
              </div>
            </div>
          </div>

          {!hasAnyTasks && statusFilter === 'all' ? (
            <EmptyState className="mt-5">
              No planner tasks yet. Add a task on the left to start organizing today, this week, or this month.
            </EmptyState>
          ) : null}

          <div className="mt-6 space-y-3">
            {unifiedTasks.length > 0 ? (
              unifiedTasks.map((task) => (
                <PlannerTaskCard
                  key={`${task.sectionId}-${task.id}`}
                  task={task}
                  sectionId={task.sectionId}
                  sectionLabel={task.sectionLabel}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddTime={handleAddTime}
                  highlight={task.isTodayMission}
                  nextFocus={nextFocusMission?.id === task.id && task.sectionId === 'today'}
                />
              ))
            ) : (
              <EmptyState>
                No tasks match this filter right now.
              </EmptyState>
            )}
          </div>
        </Card>
      </section>
    </div>
  )
}

export default PlannerIntro
