import {
  ArrowRight,
  Check,
  Plus,
  Repeat,
  Target,
  Trophy,
  PiggyBank,
} from 'lucide-react'
import { useState } from 'react'
import { readDashboardSnapshot } from '../../lib/dashboard.js'
import { togglePlannerTask, addPlannerTask } from '../../lib/planner.js'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import TaskRow from '../ui/TaskRow.jsx'

function DashboardIntro({ onNavigate }) {
  const [snapshot, setSnapshot] = useState(() => readDashboardSnapshot())
  const [newTaskTitle, setNewTaskTitle] = useState('')
  
  const primaryTask = snapshot.todaysPlannerTasks.find(t => !t.completed) ?? null
  const openTasks = snapshot.todaysPlannerTasks.filter(t => !t.completed)
  const completedTasksCount = snapshot.todaysPlannerTasks.filter(t => t.completed).length
  const isDayComplete = snapshot.todaysPlannerTasks.length > 0 && openTasks.length === 0

  const handleDashboardPlannerToggle = (taskId) => {
    togglePlannerTask('today', taskId)
    setSnapshot(readDashboardSnapshot())
  }

  const handleQuickAdd = (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    
    addPlannerTask('today', {
      title: newTaskTitle.trim(),
      priority: 'medium',
      dueDate: '',
      targetDuration: 60,
      completed: false
    })
    
    setNewTaskTitle('')
    setSnapshot(readDashboardSnapshot())
  }

  const formattedSpending = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: snapshot.currency || 'USD',
  }).format(snapshot.todaysSpendingAmount)

  const getSpendingStatus = (amount) => {
    if (amount === 0) return { color: 'text-slate-500', bg: 'bg-white/5', iconColor: 'text-slate-400' }
    if (amount < 25) return { color: 'text-amber-400', bg: 'bg-amber-500/10', iconColor: 'text-amber-400' }
    if (amount < 100) return { color: 'text-orange-400', bg: 'bg-orange-500/15', iconColor: 'text-orange-400' }
    return { color: 'text-rose-400', bg: 'bg-rose-500/20', iconColor: 'text-rose-400' }
  }

  const spendingStatus = getSpendingStatus(snapshot.todaysSpendingAmount)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 md:gap-10">
      {/* 1. Today's Identity */}
      <header className="flex flex-col gap-1 px-1">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400/80">
          {snapshot.date.fullDate}
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {snapshot.greeting}
        </h2>
      </header>

      {/* 2. Immediate Focus: The "What's Next" Hero */}
      <section>
        {isDayComplete ? (
          <Card className="relative overflow-hidden border-emerald-500/30 bg-[linear-gradient(135deg,rgba(16,185,129,0.1),rgba(15,23,42,0.95))] shadow-[0_32px_80px_rgba(6,78,59,0.3)] transition-all duration-700">
            <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
            <div className="flex flex-col items-center py-6 text-center md:py-10">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)] animate-bounce">
                <Trophy size={40} />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-white md:text-3xl">✅ Day complete!</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
                You've cleared everything on your list. Take a moment to appreciate the progress you've made today.
              </p>
              <div className="mt-8">
                <Button 
                  variant="secondary" 
                  className="h-12 px-8" 
                  onClick={() => onNavigate('planner')}
                >
                  Plan tomorrow
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className={`relative overflow-hidden border-cyan-500/20 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(8,15,30,0.98))] shadow-[0_32px_80px_rgba(8,15,30,0.6)] transition-all duration-500 ${!primaryTask ? 'opacity-75' : ''}`}>
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-500/5 blur-3xl" />
            
            <SectionHeader
              eyebrow="Next Focus"
              title={primaryTask ? primaryTask.title : 'All Clear'}
              description={primaryTask ? 'Focus on this task until it is done.' : 'You have completed all your planned tasks for today.'}
            />
            
            {primaryTask ? (
              <div className="mt-8">
                <Button 
                  className="h-14 w-full text-base font-semibold shadow-xl shadow-cyan-500/20 md:w-auto md:px-10" 
                  onClick={() => handleDashboardPlannerToggle(primaryTask.id)}
                >
                  Complete current focus
                </Button>
              </div>
            ) : (
              <div className="mt-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check size={24} strokeWidth={3} />
                </div>
                <p className="text-sm font-medium text-slate-300">Great job! Your list is empty.</p>
              </div>
            )}
          </Card>
        )}
      </section>

      {/* 3. The Management Area: Today's Plan */}
      <section className={`flex flex-col gap-6 transition-opacity duration-700 ${isDayComplete ? 'opacity-40 grayscale-[0.5]' : ''}`}>
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-semibold text-white">Today's Plan</h3>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {openTasks.length} Remaining
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {/* Quick Add Form */}
          {!isDayComplete && (
            <form onSubmit={handleQuickAdd} className="relative group">
              <input
                type="text"
                placeholder="Quick add a task for today..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-4 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500/30 focus:bg-white/[0.06] focus:ring-4 focus:ring-cyan-500/5"
              />
              <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-400" size={18} />
              {newTaskTitle && (
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
                >
                  Add
                </button>
              )}
            </form>
          )}

          {/* Task List */}
          <div className="space-y-2 mt-2">
            {snapshot.todaysPlannerTasks.length > 0 ? (
              snapshot.todaysPlannerTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  title={task.title}
                  completed={task.completed}
                  onToggle={() => handleDashboardPlannerToggle(task.id)}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {task.priority}
                  </span>
                </TaskRow>
              ))
            ) : (
              <EmptyState 
                className="bg-slate-950/20 border-dashed"
                action={{ label: 'Go to Planner', onClick: () => onNavigate('planner') }}
              >
                No active tasks. Use the input above to add one.
              </EmptyState>
            )}
          </div>
        </div>
      </section>

      {/* 4. Secondary Management & Context */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {/* Routine Card */}
        <Card className="flex flex-col justify-between p-5 border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
              <Repeat size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Routine Status</p>
              <p className="mt-0.5 truncate text-base font-semibold text-white">{snapshot.routineName}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
              <span>{snapshot.routineCompletionPercentage}% Complete</span>
              <span className="truncate max-w-[120px]">Next: {snapshot.nextIncompleteRoutineItem}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-700"
                style={{ width: `${snapshot.routineCompletionPercentage}%` }}
              />
            </div>
            <button 
              onClick={() => onNavigate('routine')}
              className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-500 transition hover:text-cyan-400"
            >
              Update Routine <ArrowRight size={12} />
            </button>
          </div>
        </Card>

        {/* Spending Card */}
        <Card className="flex flex-col justify-between p-5 border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-500 ${spendingStatus.bg} ${spendingStatus.iconColor}`}>
                <PiggyBank size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Today's Spending</p>
                <p className={`mt-0.5 text-base font-semibold transition-colors duration-500 ${snapshot.todaysSpendingCount > 0 ? spendingStatus.color : 'text-white'}`}>
                  {snapshot.todaysSpendingCount > 0 ? formattedSpending : 'No spending today'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('budget')}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              title="Add expense"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="mt-6">
            <p className="text-xs leading-relaxed text-slate-500">
              {snapshot.todaysSpendingCount > 0 
                ? `${snapshot.todaysSpendingCount} expense${snapshot.todaysSpendingCount === 1 ? '' : 's'} logged today.` 
                : 'You haven\'t logged any expenses for today.'}
            </p>
            <button 
              onClick={() => onNavigate('budget')}
              className={`mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${snapshot.todaysSpendingCount > 0 ? spendingStatus.color : 'text-amber-500'} hover:opacity-80`}
            >
              Manage Budget <ArrowRight size={12} />
            </button>
          </div>
        </Card>

        {/* Progress Card */}
        <Card className="flex flex-col justify-between p-5 border-white/5 bg-white/[0.02] sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Target size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Today's Progress</p>
              <p className="mt-0.5 text-base font-semibold text-white">
                {completedTasksCount} Tasks Completed
              </p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-xs leading-relaxed text-slate-500">
              Every small win contributes to your daily system stability. Keep up the momentum.
            </p>
            <button 
              onClick={() => onNavigate('planner')}
              className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500 transition hover:text-emerald-400"
            >
              View Planner <ArrowRight size={12} />
            </button>
          </div>
        </Card>
      </section>
    </div>
  )
}

export default DashboardIntro
