function Button({
  type = 'button',
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  const baseClassName =
    'inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition'
  const variantClassName =
    variant === 'secondary'
      ? 'border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.05]'
      : 'bg-cyan-300 font-semibold text-slate-950 hover:bg-cyan-200'

  return (
    <button
      type={type}
      className={`${baseClassName} ${variantClassName} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
