import { useMemo, useState } from 'react'
import { Check, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import PageHero from '../ui/PageHero.jsx'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import { getLocalDateKey } from '../../lib/dataUtils.js'
import {
  addPlannerTask,
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

  if (sectionId === 'tomorrow') {
    return getDateWithOffset(1)
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
  highlight = false,
  nextFocus = false,
}) {
  return (
    <article
      className={`group relative flex items-start gap-3 rounded-2xl border p-3 sm:p-4 transition-all duration-200 ${
        task.completed
          ? 'border-white/5 bg-white/[0.02] opacity-60'
          : nextFocus
            ? 'border-cyan-200/40 bg-[linear-gradient(180deg,rgba(34,211,238,0.15),rgba(15,23,42,0.9))] shadow-[0_8px_30px_rgba(34,211,238,0.12)]'
            : highlight
              ? 'border-cyan-300/20 bg-cyan-400/5'
              : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]'
      }`}
    >
      <label
        className={`mt-0.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors ${
          task.completed
            ? 'border-cyan-400 bg-cyan-400 text-slate-950'
            : 'border-white/20 bg-transparent text-transparent hover:border-cyan-400'
        }`}
        aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={task.completed}
          onChange={() => onToggle(sectionId, task.id)}
        />
        <Check size={14} className={task.completed ? 'opacity-100' : 'opacity-0'} />
      </label>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h5
              className={`text-sm font-medium sm:text-[15px] ${
                task.completed ? 'text-slate-500 line-through' : 'text-white'
              }`}
            >
              {task.title}
            </h5>
            
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className={`text-[11px] font-medium uppercase tracking-wider ${
                task.completed ? 'text-slate-500' : 'text-cyan-200/70'
              }`}>
                {sectionLabel}
              </span>
              
              {task.dueDate ? (
                <>
                  <span className="text-slate-600">•</span>
                  <span className={`text-[11px] font-medium ${
                    task.completed ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {task.dueDate}
                  </span>
                </>
              ) : null}

              {nextFocus && !task.completed ? (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="rounded bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                    Next Focus
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(sectionId, task)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Edit task"
            >
              <Pencil size={18} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(sectionId, task.id)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
              aria-label="Delete task"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:gap-5">
      <PageHero
        eyebrow="Planner"
        title="Plan your day"
        description={`Add tasks and organize them. You can focus on up to ${todayMissionLimit} tasks per day.`}
      />

      <section className="flex flex-col gap-4">
        <Card
          as="article"
          variant="hero"
          className="mx-auto w-full max-w-4xl"
        >
          <SectionHeader
            eyebrow={editingTask ? 'Edit task' : 'Add task'}
            title={editingTask ? 'Update task' : 'Create a new task'}
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

            <div className="grid gap-4 sm:grid-cols-3">
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
                  Due date
                </span>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) => updateFormValue('dueDate', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
                />
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
              ) : null}
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
                <p className="font-medium text-white">Today's tasks</p>
                <p className="mt-1 text-slate-400">
                  Focus on your most important tasks. You can add up to {todayMissionLimit} tasks for today.
                </p>
                <p className="mt-2 text-cyan-100">
                  {missionsRemaining > 0 || editingTask
                    ? `${missionsRemaining} task slot${missionsRemaining === 1 ? '' : 's'} remaining.`
                    : 'Task limit reached for today.'}
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

        <Card className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col gap-4">
            <div className="rounded-[28px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(15,23,42,0.88))] p-4 sm:p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <SectionHeader
                    eyebrow="Planner list"
                    title="All your tasks"
                    description="Your tasks, organized by when they need to happen."
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
                      Today's missions
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {plannerState.today.length} / {todayMissionLimit}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Open today
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {plannerState.today.filter((task) => !task.completed).length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Visible tasks
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {unifiedTasks.length}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                        Next Focus
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        {nextFocusMission?.title ?? 'All tasks are complete'}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {nextFocusMission
                          ? 'Your most important task for today.'
                          : 'You have no more tasks for today.'}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100">
                      <Sparkles size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-sm font-medium text-white">All planner tasks</p>
                <p className="text-sm text-slate-400">
                  View and manage all your tasks.
                </p>
              </div>
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                {statusFilter}
              </span>
            </div>
          </div>

          {!hasAnyTasks && statusFilter === 'all' ? (
            <EmptyState
              className="mt-5"
              action={{
                label: 'Create new task',
                onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              No tasks yet. Add your first task.
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
                  highlight={task.isTodayMission}
                  nextFocus={nextFocusMission?.id === task.id && task.sectionId === 'today'}
                />
              ))
            ) : (
              <EmptyState
                action={{
                  label: 'Clear filter',
                  onClick: () => setStatusFilter('all')
                }}
              >
                No tasks found.
              </EmptyState>
            )}
          </div>
        </Card>
      </section>
    </div>
  )
}

export default PlannerIntro
