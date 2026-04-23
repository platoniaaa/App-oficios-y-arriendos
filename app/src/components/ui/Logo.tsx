import { cn } from '@/lib/cn'
import { brand } from '@/config/brand'

interface Props {
  className?: string
  mark?: boolean
  variant?: 'navy' | 'cream'
}

export function Logo({ className, mark, variant = 'navy' }: Props) {
  const color = variant === 'navy' ? 'text-navy' : 'text-cream'
  return (
    <span className={cn('inline-flex items-center gap-2 font-display font-semibold tracking-tight', color, className)}>
      <svg viewBox="0 0 36 36" className="h-7 w-7 shrink-0" aria-hidden="true">
        <rect x="1" y="1" width="34" height="34" rx="8" className={variant === 'navy' ? 'fill-navy' : 'fill-cream'} />
        <path
          d="M10 24 L18 9 L26 24 Z"
          className={variant === 'navy' ? 'fill-ember' : 'fill-ember'}
        />
        <circle cx="18" cy="16" r="2.2" className={variant === 'navy' ? 'fill-cream' : 'fill-navy'} />
      </svg>
      {!mark && (
        <span className="text-[1.25rem] leading-none">
          {brand.name}
          <span className="ml-0.5 text-ember">.</span>
        </span>
      )}
    </span>
  )
}
