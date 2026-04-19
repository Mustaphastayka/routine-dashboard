import { Activity } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'

function RoutineTrendCard({ routineTrend = [], hasData = false }) {
  return (
    <Card as="article" variant="hero">
      <SectionHeader
        eyebrow="Routine completion trend"
        title="Last 7 days"
        action={
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
            <Activity size={18} />
          </div>
        }
      />

      <div className="mt-5 h-64 sm:h-72">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={routineTrend}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  color: '#e2e8f0',
                }}
              />
              <Line
                type="monotone"
                dataKey="completion"
                stroke="#67e8f9"
                strokeWidth={3}
                dot={{ fill: '#67e8f9', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState className="flex h-full items-center justify-center text-center">
            Complete a few routine items across different days to reveal your trend.
          </EmptyState>
        )}
      </div>
    </Card>
  )
}

export default RoutineTrendCard
