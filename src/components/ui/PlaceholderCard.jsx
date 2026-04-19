import Card from './Card.jsx'

function PlaceholderCard({ title, text }) {
  return (
    <Card>
      <h3 className="text-base font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </Card>
  )
}

export default PlaceholderCard
