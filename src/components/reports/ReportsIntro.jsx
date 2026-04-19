import PageHero from '../ui/PageHero.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import { readReportsSnapshot } from '../../lib/reports.js'
import ReportsSummaryCards from './ReportsSummaryCards.jsx'
import RoutineTrendCard from './RoutineTrendCard.jsx'
import SpendingSummaryCard from './SpendingSummaryCard.jsx'

function ReportsIntro() {
  const snapshot = readReportsSnapshot() ?? {
    routineTrend: [],
    hasRoutineTrendData: false,
    currentStreak: 0,
    completedTasksCount: 0,
    monthlySpendingSummary: {
      monthLabel: 'This month',
      monthlySpend: 0,
      transactionCount: 0,
      remainingAfterSpend: 0,
    },
    monthlySpendingTrend: [],
    currency: 'USD',
  }
  const hasAnyReportData =
    snapshot.hasRoutineTrendData ||
    snapshot.completedTasksCount > 0 ||
    snapshot.monthlySpendingSummary.transactionCount > 0 ||
    snapshot.monthlySpendingTrend.length > 0

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHero
        eyebrow="Reports"
        title="See patterns over time"
        description="Track routine consistency, task completion, and spending behavior with lightweight summaries that stay readable even when data is still sparse."
      />

      <ReportsSummaryCards
        currentStreak={snapshot.currentStreak}
        completedTasksCount={snapshot.completedTasksCount}
        monthlySpendingSummary={snapshot.monthlySpendingSummary}
        currency={snapshot.currency}
      />

      {!hasAnyReportData ? (
        <EmptyState>
          Reports will fill in as you complete routines, finish planner tasks, and log expenses over time.
        </EmptyState>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <RoutineTrendCard
          routineTrend={snapshot.routineTrend}
          hasData={snapshot.hasRoutineTrendData}
        />
        <SpendingSummaryCard
          summary={snapshot.monthlySpendingSummary}
          trend={snapshot.monthlySpendingTrend}
          currency={snapshot.currency}
        />
      </section>
    </div>
  )
}

export default ReportsIntro
