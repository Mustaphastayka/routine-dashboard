import Card from '../ui/Card.jsx'

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function MetricCard({ label, value, tone = 'default', hint }) {
  const toneClass =
    tone === 'positive'
      ? 'text-emerald-300'
      : tone === 'accent'
        ? 'text-cyan-200'
        : 'text-white'

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
        {label}
      </p>
      <p className={`mt-3 text-2xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-2 text-sm text-slate-400">{hint}</p>
    </Card>
  )
}

function ReportsSummaryCards({
  currentStreak = 0,
  completedTasksCount = 0,
  monthlySpendingSummary = {
    monthLabel: 'This month',
    monthlySpend: 0,
    transactionCount: 0,
    remainingAfterSpend: 0,
  },
  currency = 'USD',
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Current streak"
        value={`${currentStreak} day${currentStreak === 1 ? '' : 's'}`}
        tone="accent"
        hint="Consecutive days with full routine completion."
      />
      <MetricCard
        label="Completed tasks"
        value={`${completedTasksCount}`}
        hint="Planner tasks currently marked as complete."
      />
      <MetricCard
        label="Monthly spending"
        value={formatCurrency(monthlySpendingSummary.monthlySpend, currency)}
        hint={`${monthlySpendingSummary.transactionCount} expense entries in ${monthlySpendingSummary.monthLabel}.`}
      />
      <MetricCard
        label="After spend"
        value={formatCurrency(monthlySpendingSummary.remainingAfterSpend, currency)}
        tone={monthlySpendingSummary.remainingAfterSpend >= 0 ? 'positive' : 'default'}
        hint="Income minus recurring bills and this month's logged expenses."
      />
    </section>
  )
}

export default ReportsSummaryCards
