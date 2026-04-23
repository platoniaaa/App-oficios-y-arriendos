import { cn } from '@/lib/cn'
import { formatCLP } from '@/lib/format'

interface Props {
  value?: number
  unit?: string
  size?: 'sm' | 'md' | 'lg'
  emphasis?: boolean
  className?: string
  currency?: boolean
}

export function PriceTag({ value, unit, size = 'md', emphasis, className, currency = true }: Props) {
  const sizes = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
  } as const
  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1 font-display font-semibold tabular-nums',
        emphasis ? 'text-ember' : 'text-navy',
        sizes[size],
        className,
      )}
    >
      <span>{currency ? formatCLP(value) : value}</span>
      {unit && <span className="font-sans text-xs font-normal text-ink-400">/ {unit}</span>}
    </span>
  )
}
