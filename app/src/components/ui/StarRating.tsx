import { Star } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Props {
  value: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  count?: number
  className?: string
}

const sizeMap = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' } as const

export function StarRating({ value, size = 'md', showNumber = true, count, className }: Props) {
  const rounded = Math.round(value * 10) / 10
  return (
    <span className={cn('inline-flex items-center gap-1 text-navy', className)}>
      <span className="relative inline-block">
        <span className="flex text-ink-300">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={cn(sizeMap[size])} />
          ))}
        </span>
        <span
          className="absolute inset-0 flex overflow-hidden text-ember"
          style={{ width: `${(value / 5) * 100}%` }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={cn(sizeMap[size], 'fill-ember')} />
          ))}
        </span>
      </span>
      {showNumber && (
        <span className="font-mono text-xs font-semibold tabular-nums">{rounded.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="text-xs text-ink-400">({count})</span>
      )}
    </span>
  )
}

export function InteractiveStars({
  value,
  onChange,
  size = 'lg',
}: {
  value: number
  onChange: (n: number) => void
  size?: 'md' | 'lg'
}) {
  const classes = size === 'lg' ? 'h-8 w-8' : 'h-5 w-5'
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="transition hover:scale-110"
          aria-label={`${n} estrellas`}
        >
          <Star
            className={cn(classes, n <= value ? 'fill-ember text-ember' : 'text-ink-300')}
          />
        </button>
      ))}
    </div>
  )
}
