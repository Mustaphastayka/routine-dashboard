import { useState } from 'react'
import PageHero from '../ui/PageHero.jsx'
import {
  addExpense,
  addRecurringBill,
  deleteExpense,
  deleteRecurringBill,
  readBudgetState,
  updateExpense,
  updateMonthlyIncome,
  updateRecurringBill,
} from '../../lib/budget.js'
import BudgetSummaryCards from './BudgetSummaryCards.jsx'
import ExpenseManager from './ExpenseManager.jsx'
import IncomePanel from './IncomePanel.jsx'
import MonthlyHistoryCard from './MonthlyHistoryCard.jsx'
import RecurringBillsPanel from './RecurringBillsPanel.jsx'
import SpendingChartCard from './SpendingChartCard.jsx'

const initialBillForm = {
  title: '',
  amount: '',
  dueDay: '1',
  category: 'Housing',
}

const initialExpenseForm = {
  title: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  category: 'Other',
}

function BudgetIntro() {
  const [budgetState, setBudgetState] = useState(() => readBudgetState())
  const [editingBillId, setEditingBillId] = useState(null)
  const [editingExpenseId, setEditingExpenseId] = useState(null)
  const [billForm, setBillForm] = useState(initialBillForm)
  const [expenseForm, setExpenseForm] = useState(initialExpenseForm)

  const resetBillForm = () => {
    setEditingBillId(null)
    setBillForm({
      ...initialBillForm,
      category: budgetState.categories[0] ?? 'Other',
    })
  }

  const resetExpenseForm = () => {
    setEditingExpenseId(null)
    setExpenseForm({
      ...initialExpenseForm,
      category: budgetState.categories[0] ?? 'Other',
      date: new Date().toISOString().slice(0, 10),
    })
  }

  const updateBillForm = (field, value) => {
    setBillForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const updateExpenseForm = (field, value) => {
    setExpenseForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const handleIncomeSave = (monthlyIncome) => {
    setBudgetState(updateMonthlyIncome(monthlyIncome))
  }

  const handleBillSubmit = (event) => {
    event.preventDefault()

    if (!billForm.title.trim()) {
      return
    }

    if (editingBillId) {
      setBudgetState(updateRecurringBill(editingBillId, billForm))
    } else {
      setBudgetState(addRecurringBill(billForm))
    }

    resetBillForm()
  }

  const handleExpenseSubmit = (event) => {
    event.preventDefault()

    if (!expenseForm.title.trim() || !expenseForm.category.trim()) {
      return
    }

    if (editingExpenseId) {
      setBudgetState(updateExpense(editingExpenseId, expenseForm))
    } else {
      setBudgetState(addExpense(expenseForm))
    }

    resetExpenseForm()
  }

  const handleEditBill = (bill) => {
    setEditingBillId(bill.id)
    setBillForm({
      title: bill.title,
      amount: `${bill.amount}`,
      dueDay: `${bill.dueDay}`,
      category: bill.category,
    })
  }

  const handleEditExpense = (expense) => {
    setEditingExpenseId(expense.id)
    setExpenseForm({
      title: expense.title,
      amount: `${expense.amount}`,
      date: expense.date,
      category: expense.category,
    })
  }

  const handleDeleteBill = (billId) => {
    setBudgetState(deleteRecurringBill(billId))

    if (editingBillId === billId) {
      resetBillForm()
    }
  }

  const handleDeleteExpense = (expenseId) => {
    setBudgetState(deleteExpense(expenseId))

    if (editingExpenseId === expenseId) {
      resetExpenseForm()
    }
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHero
        eyebrow="Budget"
        title="Money with less friction"
        description="Keep monthly income, fixed bills, and flexible spending in one clear view with room to review patterns over time."
      />

      <BudgetSummaryCards
        currency={budgetState.currency}
        monthlyIncome={budgetState.monthlyIncome}
        recurringBillsTotal={budgetState.recurringBillsTotal}
        expensesTotal={budgetState.expensesTotal}
        remainingMonthlyBalance={budgetState.remainingMonthlyBalance}
      />

      <section className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
        <IncomePanel
          monthlyIncome={budgetState.monthlyIncome}
          currency={budgetState.currency}
          onSave={handleIncomeSave}
        />

        <RecurringBillsPanel
          bills={budgetState.recurringBills ?? []}
          currency={budgetState.currency}
          categories={budgetState.categories?.length ? budgetState.categories : ['Other']}
          editingBill={Boolean(editingBillId)}
          billForm={billForm}
          onBillFormChange={updateBillForm}
          onBillSubmit={handleBillSubmit}
          onEditBill={handleEditBill}
          onDeleteBill={handleDeleteBill}
          onCancelEdit={resetBillForm}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <ExpenseManager
          currency={budgetState.currency}
          expenses={(budgetState.expenses ?? [])
            .slice()
            .sort((left, right) => right.date.localeCompare(left.date))}
          categories={budgetState.categories?.length ? budgetState.categories : ['Other']}
          editingExpense={Boolean(editingExpenseId)}
          expenseForm={expenseForm}
          onExpenseFormChange={updateExpenseForm}
          onExpenseSubmit={handleExpenseSubmit}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
          onCancelEdit={resetExpenseForm}
        />

        <div className="space-y-4">
          <SpendingChartCard
            data={budgetState.categoryChartData ?? []}
            currency={budgetState.currency}
          />
          <MonthlyHistoryCard
            history={budgetState.monthlyHistory ?? []}
            currency={budgetState.currency}
          />
        </div>
      </section>
    </div>
  )
}

export default BudgetIntro
