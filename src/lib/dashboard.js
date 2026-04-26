import { readAppData } from './storage.js'
import { getLocalDateKey } from './dataUtils.js'
import { plannerSections, readPlannerState, getAllPlannerTasks, getTasksForDate } from './planner.js'
import { readBudgetState } from './budget.js'
import { readRoutineState } from './routines.js'

function formatDateParts(date = new Date()) {
  return {
    fullDate: new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date),
  }
}

function getGreeting(date = new Date()) {
  const hour = date.getHours()

  if (hour < 12) {
    return 'Good morning'
  }

  if (hour < 18) {
    return 'Good afternoon'
  }

  return 'Good evening'
}

export function readDashboardSnapshot() {
  const appData = readAppData()
  const now = new Date()
  const todayKey = getLocalDateKey(now)
  const profileName = appData.profile?.name?.trim() ?? ''
  const routineState = readRoutineState(appData)
  const selectedRoutine =
    routineState.templates.find(
      (template) => template.id === routineState.selectedTemplateId,
    ) ?? routineState.templates[0] ?? null
  const hasRoutine = routineState.totalCount > 0
  const routineCompletionPercentage = hasRoutine ? routineState.completionPercent : null
  const nextIncompleteRoutineItem = hasRoutine
    ? routineState.nextSuggestedTask?.label ?? 'All routine items complete'
    : null
  const routineStatusLabel = hasRoutine
    ? routineState.completedCount === routineState.totalCount
      ? 'Completed'
      : 'In progress'
    : 'No routine today'

  const plannerState = readPlannerState(appData)
  const allTasks = getAllPlannerTasks(plannerState)
  const todaysPlannerTasks = getTasksForDate(allTasks, todayKey)
  const topPlannerTasks = plannerSections
    .flatMap((section) =>
      plannerState[section.id].map((task) => ({
        ...task,
        source: section.label,
      })),
    )
    .filter((task) => !task.completed)
    .slice(0, 3)

  const budgetState = readBudgetState(appData)
  const transactions = budgetState.expenses
  const todaysTransactions = transactions.filter(
    (transaction) => transaction.date === todayKey,
  )
  const todaysSpendingAmount = todaysTransactions.reduce(
    (sum, transaction) => sum + Math.max(transaction.amount, 0),
    0,
  )

  return {
    dateKey: todayKey,
    date: formatDateParts(now),
    greeting: profileName ? `${getGreeting(now)}, ${profileName}` : getGreeting(now),
    routineCompletionPercentage,
    routineName: hasRoutine ? selectedRoutine?.name ?? 'Today\'s routine' : '',
    routineStatusLabel,
    routineCompletedCount: routineState.completedCount,
    routineTotalCount: routineState.totalCount,
    nextIncompleteRoutineItem,
    todaysPlannerTasks,
    topPlannerTasks,
    todaysSpendingAmount,
    todaysSpendingCount: todaysTransactions.length,
    currency: budgetState.currency,
    hasRoutine,
  }
}
