import { cn } from '@/lib/cn'

interface Props {
  label: string
  value: number // 0..1
  valueLabel?: string
  color?: 'ember' | 'moss' | 'navy'
}

export function StatProgress({ label, value, valueLabel, color = 'ember' }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  const colorMap = { ember: 'bg-ember', moss: 'bg-moss', navy: 'bg-navy' } as const
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-navy">{label}</p>
        <p className="font-mono text-sm font-semibold tabular-nums">
          {valueLabel ?? `${pct.toFixed(0)}%`}
        </p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
        <div className={cn('h-full rounded-full transition-all', colorMap[color])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
