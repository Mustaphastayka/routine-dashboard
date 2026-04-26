import Card from '../ui/Card.jsx'

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

function SummaryCard({ label, value, tone = 'default' }) {
  const toneClasses =
    tone === 'positive'
      ? 'text-emerald-300'
      : tone === 'warning'
        ? 'text-amber-300'
        : 'text-white'

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
        {label}
      </p>
      <p className={`mt-3 text-2xl font-semibold ${toneClasses}`}>{value}</p>
    </Card>
  )
}

function BudgetSummaryCards({
  currency = 'USD',
  monthlyIncome = 0,
  recurringBillsTotal = 0,
  expensesTotal = 0,
  remainingMonthlyBalance = 0,
}) {
  const remainingTone = remainingMonthlyBalance >= 0 ? 'positive' : 'warning'

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Monthly income"
        value={formatCurrency(monthlyIncome, currency)}
      />
      <SummaryCard
        label="Recurring bills"
        value={formatCurrency(recurringBillsTotal, currency)}
      />
      <SummaryCard
        label="This month spent"
        value={formatCurrency(expensesTotal, currency)}
      />
      <SummaryCard
        label="This month left"
        value={formatCurrency(remainingMonthlyBalance, currency)}
        tone={remainingTone}
      />
    </section>
  )
}

export default BudgetSummaryCards
