import { defaultAppData } from '../data/defaultAppData.js'
import { createEntityId, getMonthKey, isPlainObject } from './dataUtils.js'
import { readAppData, readNormalizedSection, updateNormalizedSection } from './storage.js'

const defaultBudget = defaultAppData.budget

function normalizeAmount(amount) {
  const numericAmount = Number(amount)
  return Number.isFinite(numericAmount) ? numericAmount : 0
}

function normalizeBill(bill, index) {
  return {
    id: bill?.id ?? `bill-${index + 1}`,
    title: bill?.title ?? bill?.name ?? `Bill ${index + 1}`,
    amount: normalizeAmount(bill?.amount),
    dueDay: Math.min(Math.max(Number(bill?.dueDay ?? 1), 1), 31),
    category: bill?.category ?? 'Other',
  }
}

function normalizeExpense(expense, index) {
  if (typeof expense === 'string') {
    return {
      id: `expense-${index + 1}`,
      title: expense,
      amount: 0,
      date: '',
      category: 'Other',
    }
  }

  return {
    id: expense?.id ?? `expense-${index + 1}`,
    title: expense?.title ?? expense?.name ?? `Expense ${index + 1}`,
    amount: normalizeAmount(expense?.amount),
    date: expense?.date ?? '',
    category: expense?.category ?? 'Other',
  }
}

function normalizeBudgetData(rawBudget) {
  const baseBudget = {
    monthlyIncome: defaultBudget.monthlyIncome,
    currency: defaultBudget.currency,
    categories: [...defaultBudget.categories],
    recurringBills: defaultBudget.recurringBills.map(normalizeBill),
    expenses: [],
  }

  if (!isPlainObject(rawBudget)) {
    return baseBudget
  }

  const categories = Array.isArray(rawBudget.categories)
    ? rawBudget.categories.filter(Boolean)
    : baseBudget.categories

  const recurringBills = Array.isArray(rawBudget.recurringBills)
    ? rawBudget.recurringBills.map(normalizeBill)
    : baseBudget.recurringBills

  const expensesSource = Array.isArray(rawBudget.expenses)
    ? rawBudget.expenses
    : Array.isArray(rawBudget.transactions)
      ? rawBudget.transactions
      : []

  return {
    monthlyIncome: normalizeAmount(rawBudget.monthlyIncome ?? baseBudget.monthlyIncome),
    currency: rawBudget.currency ?? baseBudget.currency,
    categories,
    recurringBills,
    expenses: expensesSource.map(normalizeExpense),
  }
}

function writeBudgetState(updater) {
  const nextAppData = updateNormalizedSection('budget', normalizeBudgetData, updater)
  return readBudgetState(nextAppData)
}

function getMonthLabel(monthKey) {
  if (!monthKey) {
    return 'No month'
  }

  const [year, month] = monthKey.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function readBudgetState(appData = readAppData()) {
  const budget = readNormalizedSection('budget', normalizeBudgetData, appData)
  const recurringBillsTotal = budget.recurringBills.reduce(
    (sum, bill) => sum + bill.amount,
    0,
  )
  const expensesTotal = budget.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const remainingMonthlyBalance =
    budget.monthlyIncome - recurringBillsTotal - expensesTotal

  const categoryTotalsMap = budget.expenses.reduce((totals, expense) => {
    totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount
    return totals
  }, {})

  const categoryChartData = Object.entries(categoryTotalsMap)
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 6)

  const historyMap = budget.expenses.reduce((months, expense) => {
    const monthKey = getMonthKey(expense.date)

    if (!monthKey) {
      return months
    }

    months[monthKey] = (months[monthKey] ?? 0) + expense.amount
    return months
  }, {})

  const monthlyHistory = Object.entries(historyMap)
    .sort(([leftMonth], [rightMonth]) => rightMonth.localeCompare(leftMonth))
    .slice(0, 6)
    .map(([month, expenseTotal]) => ({
      month,
      label: getMonthLabel(month),
      income: budget.monthlyIncome,
      bills: recurringBillsTotal,
      expenses: expenseTotal,
      remaining: budget.monthlyIncome - recurringBillsTotal - expenseTotal,
    }))

  return {
    ...budget,
    recurringBillsTotal,
    expensesTotal,
    remainingMonthlyBalance,
    categoryChartData,
    monthlyHistory,
  }
}

export function updateMonthlyIncome(monthlyIncome) {
  return writeBudgetState((currentBudget) => ({
    ...currentBudget,
    monthlyIncome: normalizeAmount(monthlyIncome),
  }))
}

export function addRecurringBill(billInput) {
  return writeBudgetState((currentBudget) => ({
    ...currentBudget,
    recurringBills: [
      ...currentBudget.recurringBills,
      normalizeBill(
          {
            id: createEntityId('bill'),
            title: billInput.title.trim(),
          amount: billInput.amount,
          dueDay: billInput.dueDay,
          category: billInput.category,
        },
        currentBudget.recurringBills.length,
      ),
    ],
  }))
}

export function updateRecurringBill(billId, updates) {
  return writeBudgetState((currentBudget) => ({
    ...currentBudget,
    recurringBills: currentBudget.recurringBills.map((bill) =>
      bill.id === billId
        ? normalizeBill(
            {
              ...bill,
              ...updates,
              title: (updates.title ?? bill.title).trim(),
            },
            0,
          )
        : bill,
    ),
  }))
}

export function deleteRecurringBill(billId) {
  return writeBudgetState((currentBudget) => ({
    ...currentBudget,
    recurringBills: currentBudget.recurringBills.filter((bill) => bill.id !== billId),
  }))
}

export function addExpense(expenseInput) {
  return writeBudgetState((currentBudget) => {
    const nextCategories = currentBudget.categories.includes(expenseInput.category)
      ? currentBudget.categories
      : [...currentBudget.categories, expenseInput.category]

    return {
      ...currentBudget,
      categories: nextCategories,
      expenses: [
        ...currentBudget.expenses,
        normalizeExpense(
          {
            id: createEntityId('expense'),
            title: expenseInput.title.trim(),
            amount: expenseInput.amount,
            date: expenseInput.date,
            category: expenseInput.category,
          },
          currentBudget.expenses.length,
        ),
      ],
    }
  })
}

export function updateExpense(expenseId, updates) {
  return writeBudgetState((currentBudget) => {
    const nextCategory = updates.category
    const nextCategories =
      nextCategory && !currentBudget.categories.includes(nextCategory)
        ? [...currentBudget.categories, nextCategory]
        : currentBudget.categories

    return {
      ...currentBudget,
      categories: nextCategories,
      expenses: currentBudget.expenses.map((expense) =>
        expense.id === expenseId
          ? normalizeExpense(
              {
                ...expense,
                ...updates,
                title: (updates.title ?? expense.title).trim(),
              },
              0,
            )
          : expense,
      ),
    }
  })
}

export function deleteExpense(expenseId) {
  return writeBudgetState((currentBudget) => ({
    ...currentBudget,
    expenses: currentBudget.expenses.filter((expense) => expense.id !== expenseId),
  }))
}
