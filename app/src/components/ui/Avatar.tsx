import { cn } from '@/lib/cn'
import { initials } from '@/lib/format'

interface Props {
  src?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  ring?: boolean
  className?: string
}

const sizes = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-base',
  xl: 'h-24 w-24 text-lg',
}

export function Avatar({ src, name, size = 'md', ring, className }: Props) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream-deep font-display font-semibold text-navy',
        sizes[size],
        ring && 'ring-2 ring-ember ring-offset-2 ring-offset-cream',
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name ?? 'avatar'} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span>{initials(name)}</span>
      )}
    </span>
  )
}
