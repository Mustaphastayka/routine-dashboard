import { Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'

function RecurringBillsPanel({
  bills,
  currency,
  categories,
  editingBill,
  billForm,
  onBillFormChange,
  onBillSubmit,
  onEditBill,
  onDeleteBill,
  onCancelEdit,
}) {
  return (
    <Card>
      <SectionHeader
        eyebrow="Recurring bills"
        title="Keep fixed costs visible"
        action={
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
            <Plus size={18} />
          </div>
        }
      />

      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={onBillSubmit}>
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-300">Title</span>
          <input
            type="text"
            value={billForm.title}
            onChange={(event) => onBillFormChange('title', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
            placeholder="Rent, phone bill, software..."
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={billForm.amount}
            onChange={(event) => onBillFormChange('amount', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Due day</span>
          <input
            type="number"
            min="1"
            max="31"
            value={billForm.dueDay}
            onChange={(event) => onBillFormChange('dueDay', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-300">Category</span>
          <select
            value={billForm.category}
            onChange={(event) => onBillFormChange('category', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
          <Button type="submit" className="flex-1">
            {editingBill ? 'Save bill' : 'Add bill'}
          </Button>
          {editingBill ? (
            <Button type="button" variant="secondary" onClick={onCancelEdit}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>

      <div className="mt-5 space-y-3">
        {bills.length > 0 ? (
          bills.map((bill) => (
            <article
              key={bill.id}
              className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-medium text-white">{bill.title}</h4>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                    {bill.category} • due day {bill.dueDay}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEditBill(bill)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-200"
                    aria-label="Edit recurring bill"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteBill(bill.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-rose-300/30 hover:text-rose-200"
                    aria-label="Delete recurring bill"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <p className="mt-3 text-lg font-semibold text-white">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency,
                  maximumFractionDigits: 2,
                }).format(bill.amount)}
              </p>
            </article>
          ))
        ) : (
          <EmptyState
            action={{
              label: 'Add a bill',
              onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            No recurring bills yet. Add rent, utilities, subscriptions, or other fixed costs here.
          </EmptyState>
        )}
      </div>
    </Card>
  )
}

export default RecurringBillsPanel
