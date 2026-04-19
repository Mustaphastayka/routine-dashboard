import Card from '../ui/Card.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'
import { Calendar } from 'lucide-react'

function ConsistencyGrid({ data = [] }) {
  const getIntensityClass = (completion) => {
    if (completion === 0) return 'bg-white/5 border-white/5'
    if (completion < 25) return 'bg-cyan-500/20 border-cyan-500/10'
    if (completion < 50) return 'bg-cyan-500/40 border-cyan-500/20'
    if (completion < 75) return 'bg-cyan-500/70 border-cyan-500/30'
    return 'bg-cyan-400 border-cyan-300'
  }

  return (
    <Card className="flex flex-col h-full">
      <SectionHeader
        eyebrow="Routine Consistency"
        title="Last 28 Days"
        description="A visual look at your routine habit strength."
        action={
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
            <Calendar size={18} />
          </div>
        }
      />
      
      <div className="mt-6 flex-1 flex items-center justify-center">
        <div className="grid grid-cols-7 gap-2">
          {data.map((day, idx) => (
            <div
              key={day.date}
              className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg border ${getIntensityClass(day.completion)} transition-all duration-300 hover:scale-110`}
              title={`${day.date}: ${day.completion}%`}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 font-bold">
        <span>28 days ago</span>
        <span>Today</span>
      </div>
    </Card>
  )
}

export default ConsistencyGrid
