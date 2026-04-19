import { Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

function ExpenseManager({
  currency,
  expenses,
  categories,
  editingExpense,
  expenseForm,
  onExpenseFormChange,
  onExpenseSubmit,
  onEditExpense,
  onDeleteExpense,
  onCancelEdit,
}) {
  return (
    <Card>
      <SectionHeader
        eyebrow="Expenses"
        title="Track flexible spending"
        action={
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
            <Plus size={18} />
          </div>
        }
      />

      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={onExpenseSubmit}>
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-300">Title</span>
          <input
            type="text"
            value={expenseForm.title}
            onChange={(event) => onExpenseFormChange('title', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
            placeholder="Groceries, coffee, transport..."
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={expenseForm.amount}
            onChange={(event) => onExpenseFormChange('amount', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Date</span>
          <input
            type="date"
            value={expenseForm.date}
            onChange={(event) => onExpenseFormChange('date', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-300">Category</span>
          <input
            list="budget-categories"
            value={expenseForm.category}
            onChange={(event) => onExpenseFormChange('category', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
          />
          <datalist id="budget-categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </label>

        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
          <Button type="submit" className="flex-1">
            {editingExpense ? 'Save expense' : 'Add expense'}
          </Button>
          {editingExpense ? (
            <Button type="button" variant="secondary" onClick={onCancelEdit}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>

      <div className="mt-5 space-y-3">
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <article
              key={expense.id}
              className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-medium text-white">
                    {expense.title}
                  </h4>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                    {expense.category} • {expense.date || 'No date'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEditExpense(expense)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-200"
                    aria-label="Edit expense"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteExpense(expense.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-rose-300/30 hover:text-rose-200"
                    aria-label="Delete expense"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <p className="mt-3 text-lg font-semibold text-white">
                {formatCurrency(expense.amount, currency)}
              </p>
            </article>
          ))
        ) : (
          <EmptyState
            action={{
              label: 'Log an expense',
              onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            No expenses logged yet for this dashboard.
          </EmptyState>
        )}
      </div>
    </Card>
  )
}

export default ExpenseManager
