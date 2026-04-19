import { Wallet } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
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

function SpendingSummaryCard({
  summary = { monthLabel: 'This month', monthlySpend: 0, transactionCount: 0 },
  trend = [],
  currency = 'USD',
}) {
  return (
    <Card>
      <SectionHeader
        eyebrow="Monthly spending summary"
        title={summary.monthLabel}
        action={
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
            <Wallet size={18} />
          </div>
        }
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4">
          <p className="text-sm text-slate-400">Spent this month</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatCurrency(summary.monthlySpend, currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-4">
          <p className="text-sm text-slate-400">Expense entries</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {summary.transactionCount}
          </p>
        </div>
      </div>

      <div className="mt-5 h-56 sm:h-64">
        {trend.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), currency)}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  color: '#e2e8f0',
                }}
              />
              <Bar dataKey="spending" fill="#38bdf8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState className="flex h-full items-center justify-center text-center">
            Add expenses in different months to unlock the spending history chart.
          </EmptyState>
        )}
      </div>
    </Card>
  )
}

export default SpendingSummaryCard
