import Card from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function MonthlyHistoryCard({ history, currency }) {
  return (
    <Card>
      <SectionHeader eyebrow="Monthly history" title="Recent month snapshots" />

      <div className="mt-5 space-y-3">
        {history.length > 0 ? (
          history.map((month) => (
            <article
              key={month.month}
              className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-medium text-white">{month.label}</h4>
                <span
                  className={`text-sm font-semibold ${
                    month.remaining >= 0 ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {formatCurrency(month.remaining, currency)}
                </span>
              </div>
              <div className="mt-3 grid gap-3 text-xs text-slate-400 sm:grid-cols-3">
                <div>
                  <p className="uppercase tracking-[0.16em]">Income</p>
                  <p className="mt-1 text-sm text-white">
                    {formatCurrency(month.income, currency)}
                  </p>
                </div>
                <div>
                  <p className="uppercase tracking-[0.16em]">Bills</p>
                  <p className="mt-1 text-sm text-white">
                    {formatCurrency(month.bills, currency)}
                  </p>
                </div>
                <div>
                  <p className="uppercase tracking-[0.16em]">Expenses</p>
                  <p className="mt-1 text-sm text-white">
                    {formatCurrency(month.expenses, currency)}
                  </p>
                </div>
              </div>
            </article>
          ))
        ) : (
          <EmptyState>
            Monthly history will appear once expenses span multiple dates.
          </EmptyState>
        )}
      </div>
    </Card>
  )
}

export default MonthlyHistoryCard
