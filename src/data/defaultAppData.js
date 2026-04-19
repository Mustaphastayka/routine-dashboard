export const APP_STORAGE_KEY = 'routine-dashboard-data'

export const defaultAppData = {
  profile: {
    name: '',
    timezone: 'Africa/Casablanca',
    theme: 'dark',
    startOfWeek: 'monday',
    selectedRoutineTemplateId: '',
  },
  routineTemplates: [],
  dailyProgressByDate: {},
  planner: {
    today: [],
    thisWeek: [],
    thisMonth: [],
  },
  budget: {
    currency: 'USD',
    monthlyIncome: 4200,
    categories: [
      'Housing',
      'Utilities',
      'Food',
      'Transport',
      'Health',
      'Work',
      'Leisure',
      'Other',
    ],
    recurringBills: [
      {
        id: 'rent',
        title: 'Rent',
        amount: 1200,
        dueDay: 1,
        category: 'Housing',
      },
      {
        id: 'internet',
        title: 'Internet',
        amount: 60,
        dueDay: 8,
        category: 'Utilities',
      },
    ],
    expenses: [],
  },
  reportsSummary: {
    streakDays: 0,
    completionRate: 0,
    weeklyFocusMinutes: 0,
    monthlySpend: 0,
  },
}
