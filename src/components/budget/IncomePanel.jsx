import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import SectionHeader from '../ui/SectionHeader.jsx'

function IncomePanel({ monthlyIncome, currency, onSave }) {
  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onSave(formData.get('monthlyIncome') ?? '0')
  }

  return (
    <Card as="article" variant="hero">
      <SectionHeader
        eyebrow="Monthly income"
        title="Set your income baseline"
      />

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Income ({currency})
          </span>
          <input
            name="monthlyIncome"
            type="number"
            min="0"
            step="0.01"
            defaultValue={monthlyIncome}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
          />
        </label>

        <Button type="submit" className="w-full">
          Save income
        </Button>
      </form>
    </Card>
  )
}

export default IncomePanel
