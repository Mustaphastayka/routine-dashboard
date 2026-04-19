function Card({
  as: Component = 'article',
  variant = 'default',
  className = '',
  children,
}) {
  const Element = Component
  const baseClassName = 'min-w-0 border border-white/8'
  const variantClassName =
    variant === 'hero'
      ? 'rounded-[28px] bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.72))] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.35)] sm:p-6'
      : variant === 'subtle'
        ? 'rounded-[24px] bg-slate-950/35 p-4'
        : 'rounded-[24px] bg-white/[0.03] p-5'

  return (
    <Element className={`${baseClassName} ${variantClassName} ${className}`.trim()}>
      {children}
    </Element>
  )
}

export default Card
