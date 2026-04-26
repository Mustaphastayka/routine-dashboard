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
      <SectionHeader eyebrow="Monthly history" title="Recent spending snapshots" />

      <div className="mt-5 space-y-3">
        {history.length > 0 ? (
          history.map((month) => (
            <article
              key={month.month}
              className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-medium text-white">{month.label}</h4>
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(month.expenses, currency)}
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                <div>
                  <p className="uppercase tracking-[0.16em]">Expenses logged</p>
                  <p className="mt-1 text-sm text-white">
                    {formatCurrency(month.expenses, currency)}
                  </p>
                </div>
              </div>
            </article>
          ))
        ) : (
          <EmptyState>
            Monthly history will appear once expenses are logged across different months.
          </EmptyState>
        )}
      </div>
    </Card>
  )
}

export default MonthlyHistoryCard
