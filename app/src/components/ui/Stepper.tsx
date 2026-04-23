import { cn } from '@/lib/cn'
import { Check } from 'lucide-react'

interface Props {
  steps: string[]
  current: number
  className?: string
}

export function Stepper({ steps, current, className }: Props) {
  return (
    <ol className={cn('flex w-full items-center gap-1', className)}>
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-bold',
                done
                  ? 'border-navy bg-navy text-cream'
                  : active
                    ? 'border-ember bg-ember text-cream'
                    : 'border-navy/20 bg-cream text-ink-400',
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span
              className={cn(
                'hidden text-xs font-semibold uppercase tracking-wide sm:inline',
                active ? 'text-navy' : 'text-ink-400',
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  'h-0.5 flex-1',
                  done ? 'bg-navy' : 'bg-navy/10',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
