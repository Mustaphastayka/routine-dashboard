import { readBudgetState } from './budget.js'
import { plannerSections, readPlannerState } from './planner.js'
import {
  normalizeRoutineTemplate,
  readRoutineState,
} from './routines.js'
import { readAppData } from './storage.js'
import { getLocalDateKey, getMonthKey } from './dataUtils.js'

function formatDayLabel(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
  }).format(date)
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
  }).format(date)
}

function getDateKeyForOffset(offset) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + offset)

  return {
    key: getLocalDateKey(date),
    label: formatDayLabel(date),
  }
}

function getSelectedTemplate(appData) {
  const templates = Array.isArray(appData.routineTemplates)
    ? appData.routineTemplates.map(normalizeRoutineTemplate)
    : []
  const selectedTemplateId = appData.profile?.selectedRoutineTemplateId

  return (
    templates.find((template) => template.id === selectedTemplateId) ?? templates[0] ?? null
  )
}

function getCompletionPercent({ dateKey, template, dailyProgressByDate }) {
  if (!template || template.steps.length === 0) {
    return 0
  }

  const completedStepIds =
    dailyProgressByDate?.[dateKey]?.completionByTemplate?.[template.id] ?? []

  return Math.round((completedStepIds.length / template.steps.length) * 100)
}

function buildRoutineTrend({ template, dailyProgressByDate }) {
  return Array.from({ length: 7 }, (_, index) => {
    const { key, label } = getDateKeyForOffset(index - 6)

    return {
      date: key,
      label,
      completion: getCompletionPercent({
        dateKey: key,
        template,
        dailyProgressByDate,
      }),
    }
  })
}

function getCurrentStreak({ template, dailyProgressByDate }) {
  if (!template || template.steps.length === 0) {
    return 0
  }

  let streak = 0

  for (let offset = 0; offset > -365; offset -= 1) {
    const { key } = getDateKeyForOffset(offset)
    const percent = getCompletionPercent({
      dateKey: key,
      template,
      dailyProgressByDate,
    })

    if (percent === 100) {
      streak += 1
      continue
    }

    break
  }

  return streak
}

function getCompletedTasksCount(plannerState) {
  return plannerSections.reduce(
    (sum, section) =>
      sum + plannerState[section.id].filter((task) => task.completed).length,
    0,
  )
}

function getMonthlySpendingSummary(budgetState) {
  const currentMonthKey = getMonthKey(getLocalDateKey())
  const currentMonthExpenses = budgetState.expenses.filter((expense) =>
    expense.date.startsWith(currentMonthKey),
  )
  const monthlySpend = currentMonthExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  )

  return {
    monthLabel: new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(new Date()),
    monthlySpend,
    transactionCount: currentMonthExpenses.length,
    remainingAfterSpend:
      budgetState.monthlyIncome - budgetState.recurringBillsTotal - monthlySpend,
  }
}

function buildMonthlySpendingTrend(budgetState) {
  return budgetState.monthlyHistory
    .slice()
    .reverse()
    .map((entry) => ({
      month: formatMonthLabel(entry.month),
      spending: entry.expenses,
      remaining: entry.remaining,
    }))
}

export function readReportsSnapshot() {
  const appData = readAppData()
  const routineState = readRoutineState(appData)
  const plannerState = readPlannerState(appData)
  const budgetState = readBudgetState(appData)
  const selectedTemplate = getSelectedTemplate(appData)
  const routineTrend = buildRoutineTrend({
    template: selectedTemplate,
    dailyProgressByDate: routineState.dailyProgressByDate,
  })
  const routineDataPoints = routineTrend.filter((point) => point.completion > 0).length

  return {
    routineTrend,
    hasRoutineTrendData: routineDataPoints > 0,
    currentStreak: getCurrentStreak({
      template: selectedTemplate,
      dailyProgressByDate: routineState.dailyProgressByDate,
    }),
    completedTasksCount: getCompletedTasksCount(plannerState),
    monthlySpendingSummary: getMonthlySpendingSummary(budgetState),
    monthlySpendingTrend: buildMonthlySpendingTrend(budgetState),
    currency: budgetState.currency,
  }
}
