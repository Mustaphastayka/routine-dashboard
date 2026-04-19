import PageHero from '../ui/PageHero.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import { readReportsSnapshot } from '../../lib/reports.js'
import ReportsSummaryCards from './ReportsSummaryCards.jsx'
import RoutineTrendCard from './RoutineTrendCard.jsx'
import SpendingSummaryCard from './SpendingSummaryCard.jsx'
import ConsistencyGrid from './ConsistencyGrid.jsx'

function ReportsIntro() {
  const snapshot = readReportsSnapshot() ?? {
    routineTrend: [],
    consistencyTrend: [],
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 md:gap-8">
      <PageHero
        eyebrow="Reports"
        title="Your progress over time"
        description="A simple look at your habits, tasks, and spending."
      />

      <ReportsSummaryCards
        currentStreak={snapshot.currentStreak}
        completedTasksCount={snapshot.completedTasksCount}
        monthlySpendingSummary={snapshot.monthlySpendingSummary}
        currency={snapshot.currency}
      />

      {!hasAnyReportData ? (
        <EmptyState className="bg-slate-950/20">
          Start using the Planner, Routine, and Budget to see your trends here.
        </EmptyState>
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] md:gap-6">
            <RoutineTrendCard
              routineTrend={snapshot.routineTrend}
              hasData={snapshot.hasRoutineTrendData}
            />
            <ConsistencyGrid data={snapshot.consistencyTrend} />
          </section>

          <section className="grid gap-4 md:gap-6">
            <SpendingSummaryCard
              summary={snapshot.monthlySpendingSummary}
              trend={snapshot.monthlySpendingTrend}
              currency={snapshot.currency}
            />
          </section>
        </>
      )}
    </div>
  )
}

export default ReportsIntro

