import { useState } from 'react'
import {
  BarChart3,
  CalendarDays,
  Home,
  PiggyBank,
  Repeat,
} from 'lucide-react'
import AppShell from './components/layout/AppShell.jsx'
import Budget from './pages/Budget.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Planner from './pages/Planner.jsx'
import Reports from './pages/Reports.jsx'
import Routine from './pages/Routine.jsx'
import Settings from './pages/Settings.jsx'

const primaryNavItems = [
  {
    id: 'dashboard',
    label: 'Home',
    title: 'Dashboard',
    subtitle: 'A calm overview of your personal system.',
    icon: Home,
    component: Dashboard,
  },
  {
    id: 'routine',
    label: 'Routine',
    title: 'Routine',
    subtitle: 'Keep your habits and anchors close at hand.',
    icon: Repeat,
    component: Routine,
  },
  {
    id: 'planner',
    label: 'Planner',
    title: 'Planner',
    subtitle: 'Shape the day before the day shapes you.',
    icon: CalendarDays,
    component: Planner,
  },
  {
    id: 'budget',
    label: 'Budget',
    title: 'Budget',
    subtitle: 'Stay aware of money with less mental overhead.',
    icon: PiggyBank,
    component: Budget,
  },
  {
    id: 'reports',
    label: 'Reports',
    title: 'Reports',
    subtitle: 'Review progress and patterns over time.',
    icon: BarChart3,
    component: Reports,
  },
]

const settingsPage = {
  id: 'settings',
  title: 'Settings',
  subtitle: 'App preferences and account controls will live here.',
  component: Settings,
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const currentPage =
    primaryNavItems.find((item) => item.id === activePage) ?? settingsPage
  const ActivePageComponent = currentPage.component

  return (
    <AppShell
      appTitle="Routine Dashboard"
      pageTitle={currentPage.title}
      pageSubtitle={currentPage.subtitle}
      activePage={activePage}
      primaryNavItems={primaryNavItems}
      onNavigate={setActivePage}
      onOpenSettings={() => setActivePage('settings')}
    >
      <ActivePageComponent onNavigate={setActivePage} />
    </AppShell>
  )
}

export default App
