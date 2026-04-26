import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import Card from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'

const chartColors = ['#67e8f9', '#38bdf8', '#22c55e', '#f59e0b', '#fb7185', '#a78bfa']

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function SpendingChartCard({ data, currency }) {
  return (
    <Card>
      <SectionHeader
        eyebrow="Spending chart"
        title="This month's expenses by category"
      />

      <div className="mt-5 h-64 sm:h-72">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={64}
                outerRadius={92}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${entry.value}`}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), currency)}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  color: '#e2e8f0',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState className="flex h-full items-center justify-center text-center">
            Add a few expenses this month to generate a category chart.
          </EmptyState>
        )}
      </div>

      {data.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {data.map((entry, index) => (
            <div
              key={entry.name}
              className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/8 bg-slate-950/35 px-3 py-2"
            >
              <span className="flex min-w-0 items-center gap-2 text-sm text-slate-300">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: chartColors[index % chartColors.length] }}
                />
                <span className="truncate">{entry.name}</span>
              </span>
              <span className="shrink-0 text-sm font-medium text-white">
                {formatCurrency(entry.value, currency)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  )
}

export default SpendingChartCard
