import Card from './Card.jsx'

function PageHero({ eyebrow, title, description }) {
  return (
    <Card
      as="section"
      variant="hero"
      className="bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(15,23,42,0.72))] shadow-[0_20px_60px_rgba(15,23,42,0.45)]"
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
        {description}
      </p>
    </Card>
  )
}

export default PageHero
