import {
  ArrowRight,
  Check,
  PiggyBank,
  Plus,
  Repeat,
  Target,
  Trophy,
} from 'lucide-react'
import { useState } from 'react'
import { readDashboardSnapshot } from '../../lib/dashboard.js'
import { addPlannerTask, togglePlannerTask } from '../../lib/planner.js'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import TaskRow from '../ui/TaskRow.jsx'

function DashboardIntro({ onNavigate }) {
  const [snapshot, setSnapshot] = useState(() => readDashboardSnapshot())
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const primaryTask = snapshot.todaysPlannerTasks.find((task) => !task.completed) ?? null
  const openTasks = snapshot.todaysPlannerTasks.filter((task) => !task.completed)
  const completedTasksCount = snapshot.todaysPlannerTasks.filter((task) => task.completed).length
  const isDayComplete = snapshot.todaysPlannerTasks.length > 0 && openTasks.length === 0

  const handleDashboardPlannerToggle = (task) => {
    togglePlannerTask(task.sectionId, task.id)
    setSnapshot(readDashboardSnapshot())
  }

  const handleQuickAdd = (event) => {
    event.preventDefault()

    if (!newTaskTitle.trim()) {
      return
    }

    addPlannerTask('today', {
      title: newTaskTitle.trim(),
      priority: 'medium',
      dueDate: snapshot.dateKey,
      targetDuration: 60,
      completed: false,
    })

    setNewTaskTitle('')
    setSnapshot(readDashboardSnapshot())
  }

  const formattedSpending = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: snapshot.currency || 'USD',
  }).format(snapshot.todaysSpendingAmount)

  const getSpendingStatus = (amount) => {
    if (amount === 0) {
      return { color: 'text-slate-500', bg: 'bg-white/5', iconColor: 'text-slate-400' }
    }

    if (amount < 25) {
      return { color: 'text-amber-400', bg: 'bg-amber-500/10', iconColor: 'text-amber-400' }
    }

    if (amount < 100) {
      return { color: 'text-orange-400', bg: 'bg-orange-500/15', iconColor: 'text-orange-400' }
    }

    return { color: 'text-rose-400', bg: 'bg-rose-500/20', iconColor: 'text-rose-400' }
  }

  const spendingStatus = getSpendingStatus(snapshot.todaysSpendingAmount)
  const secondaryCardClassName =
    'flex flex-col justify-between rounded-[26px] border-white/6 bg-white/[0.018] p-4 shadow-[0_14px_36px_rgba(2,6,23,0.12)] transition-all duration-300 md:hover:-translate-y-0.5 md:hover:border-white/10 md:hover:bg-white/[0.028] md:hover:shadow-[0_18px_42px_rgba(2,6,23,0.18)]'

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 md:gap-14">
      <header className="flex flex-col gap-1.5 px-1">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400/80">
          {snapshot.date.fullDate}
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {snapshot.greeting}
        </h2>
      </header>

      <section className="pt-1">
        {isDayComplete ? (
          <Card className="relative overflow-hidden rounded-[30px] border-emerald-400/35 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(15,23,42,0.95))] shadow-[0_28px_80px_rgba(6,78,59,0.26)] ring-1 ring-emerald-400/15 transition-all duration-500 md:hover:-translate-y-0.5 md:hover:shadow-[0_34px_90px_rgba(6,78,59,0.32)]">
            <div className="absolute inset-y-0 left-0 w-1 rounded-full bg-emerald-400/80" />
            <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
            <div className="absolute left-10 top-8 h-28 w-28 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="flex flex-col items-center py-7 text-center md:py-10">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)] animate-bounce">
                <Trophy size={40} />
              </div>
              <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">
                Day Complete
              </p>
              <h3 className="mt-3 text-3xl font-bold text-white md:text-4xl">Day complete!</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">
                Everything for today is done. Take a breath and enjoy the feeling of a finished day.
              </p>
              <div className="mt-8">
                <Button
                  variant="secondary"
                  className="h-12 rounded-[20px] px-8 transition-all duration-300 md:hover:-translate-y-0.5"
                  onClick={() => onNavigate('planner')}
                >
                  Plan tomorrow
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card
            className={`relative overflow-hidden rounded-[30px] border border-cyan-400/30 bg-[linear-gradient(135deg,rgba(10,18,35,0.98),rgba(8,15,30,1))] shadow-[0_30px_85px_rgba(6,182,212,0.16)] ring-1 ring-cyan-400/10 transition-all duration-500 md:hover:-translate-y-0.5 md:hover:shadow-[0_36px_95px_rgba(6,182,212,0.22)] ${!primaryTask ? 'opacity-80' : ''}`}
          >
            <div className="absolute inset-y-0 left-0 w-1 rounded-full bg-cyan-400/80" />
            <div className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-500/10 blur-[100px]" />

            <div className="relative flex flex-col gap-6 py-2 md:gap-8">
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-cyan-300">
                  Next Focus
                </p>
                <h3 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-[2.8rem]">
                  {primaryTask ? primaryTask.title : 'All Clear'}
                </h3>
                <p className="text-sm font-medium text-slate-400">
                  {primaryTask
                    ? 'Do this next.'
                    : 'You have completed all your planned tasks for today.'}
                </p>
              </div>

              {primaryTask ? (
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-200">
                    {primaryTask.priority} priority
                  </span>
                </div>
              ) : null}

              {primaryTask ? (
                <div>
                  <Button
                    className="h-14 w-full rounded-[20px] text-base font-semibold shadow-[0_16px_40px_rgba(6,182,212,0.22)] transition-all duration-300 md:w-auto md:min-w-[240px] md:px-10 md:hover:-translate-y-0.5 md:hover:shadow-[0_20px_48px_rgba(6,182,212,0.28)]"
                    onClick={() => handleDashboardPlannerToggle(primaryTask)}
                  >
                    Complete current focus
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check size={24} strokeWidth={3} />
                  </div>
                  <p className="text-sm font-medium text-slate-300">
                    No tasks for today, enjoy your time.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
      </section>

      <section
        className={`flex flex-col gap-7 transition-opacity duration-700 ${isDayComplete ? 'opacity-40 grayscale-[0.5]' : ''}`}
      >
        <div className="flex items-center justify-between px-1">
          <h3 className="text-2xl font-semibold text-white">Today&apos;s Plan</h3>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {openTasks.length} Remaining
          </span>
        </div>

        <div className="flex flex-col gap-4 rounded-[30px] border border-white/6 bg-white/[0.02] px-4 py-4 shadow-[0_20px_55px_rgba(2,6,23,0.2)] transition-all duration-300 md:hover:shadow-[0_24px_65px_rgba(2,6,23,0.24)] sm:px-5 sm:py-5">
          {!isDayComplete ? (
            <form onSubmit={handleQuickAdd} className="group relative">
              <input
                type="text"
                placeholder="Quick add a task for today..."
                value={newTaskTitle}
                onChange={(event) => setNewTaskTitle(event.target.value)}
                className="w-full rounded-[20px] border border-white/10 bg-white/[0.03] py-4 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-cyan-500/30 focus:bg-white/[0.06] focus:ring-4 focus:ring-cyan-500/5"
              />
              <Plus
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-400"
                size={18}
              />
              {newTaskTitle ? (
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition duration-300 hover:bg-cyan-400"
                >
                  Add
                </button>
              ) : null}
            </form>
          ) : null}

          <div className="mt-1 space-y-2">
            {snapshot.todaysPlannerTasks.length > 0 ? (
              snapshot.todaysPlannerTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  title={task.title}
                  completed={task.completed}
                  onToggle={() => handleDashboardPlannerToggle(task)}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {task.priority}
                  </span>
                </TaskRow>
              ))
            ) : (
              <EmptyState
                className="border-dashed bg-slate-950/20"
                action={{ label: 'Add task', onClick: () => onNavigate('planner') }}
              >
                No tasks for today, enjoy your time or add one when you&apos;re ready.
              </EmptyState>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 pt-1 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
        <Card className={secondaryCardClassName}>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/8 text-cyan-400/90">
              <Repeat size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Routine Status
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-white">
                {snapshot.hasRoutine ? snapshot.routineName : 'No routine set for today'}
              </p>
            </div>
          </div>

          <div className="mt-5">
            {snapshot.hasRoutine ? (
              <>
                <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-slate-400">
                  <span>{snapshot.routineCompletionPercentage}% Complete</span>
                  <span className="max-w-[120px] truncate">
                    Next: {snapshot.nextIncompleteRoutineItem}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all duration-700"
                    style={{ width: `${snapshot.routineCompletionPercentage}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-center">
                <p className="text-sm font-medium text-slate-200">No routine set for today</p>
                <p className="mt-1 text-xs text-slate-400">
                  Nothing is scheduled, so today stays open and flexible.
                </p>
              </div>
            )}
            <button
              onClick={() => onNavigate('routine')}
              className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-cyan-500 transition hover:text-cyan-400"
            >
              Update Routine <ArrowRight size={12} />
            </button>
          </div>
        </Card>

        <Card className={secondaryCardClassName}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-colors duration-500 ${spendingStatus.bg} ${spendingStatus.iconColor}`}
              >
                <PiggyBank size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Today&apos;s Spending
                </p>
                <p
                  className={`mt-0.5 text-sm font-semibold transition-colors duration-500 ${snapshot.todaysSpendingCount > 0 ? spendingStatus.color : 'text-white'}`}
                >
                  {snapshot.todaysSpendingCount > 0
                    ? formattedSpending
                    : 'No spending today, good job'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('budget')}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition duration-300 hover:bg-white/10 hover:text-white"
              title="Add expense"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="mt-5">
            <p className="text-xs leading-relaxed text-slate-500">
              {snapshot.todaysSpendingCount > 0
                ? `${snapshot.todaysSpendingCount} expense${snapshot.todaysSpendingCount === 1 ? '' : 's'} logged today.`
                : 'No spending today, good job keeping things light.'}
            </p>
            <button
              onClick={() => onNavigate('budget')}
              className={`mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-colors duration-500 ${snapshot.todaysSpendingCount > 0 ? spendingStatus.color : 'text-amber-500'} hover:opacity-80`}
            >
              Manage Budget <ArrowRight size={12} />
            </button>
          </div>
        </Card>

        <Card className={`${secondaryCardClassName} sm:col-span-2 lg:col-span-1`}>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/8 text-emerald-400/90">
              <Target size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Today&apos;s Progress
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                {completedTasksCount} Tasks Completed
              </p>
            </div>
          </div>
          <div className="mt-5">
            <p className="text-xs leading-relaxed text-slate-500">
              {completedTasksCount > 0
                ? 'Every small win contributes to your daily system stability. Keep up the momentum.'
                : 'No completed tasks yet. Start with your next focus when you are ready.'}
            </p>
            <button
              onClick={() => onNavigate('planner')}
              className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-500 transition hover:text-emerald-400"
            >
              {completedTasksCount > 0 ? 'View Planner' : 'Add task'} <ArrowRight size={12} />
            </button>
          </div>
        </Card>
      </section>
    </div>
  )
}

export default DashboardIntro
