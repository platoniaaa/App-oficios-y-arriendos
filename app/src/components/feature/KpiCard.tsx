import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  hint?: string
  trend?: { dir: 'up' | 'down'; label: string }
  icon?: ReactNode
  tone?: 'default' | 'ember' | 'moss' | 'rust'
  className?: string
}

const toneBg: Record<NonNullable<Props['tone']>, string> = {
  default: 'bg-white',
  ember: 'bg-ember/5 border-ember/30',
  moss: 'bg-moss/5 border-moss/30',
  rust: 'bg-rust/5 border-rust/30',
}

export function KpiCard({ label, value, hint, trend, icon, tone = 'default', className }: Props) {
  return (
    <div className={cn('card flex flex-col gap-3 p-5', toneBg[tone], className)}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-500">
          {label}
        </p>
        {icon && <span className="text-ember-600">{icon}</span>}
      </div>
      <p className="font-display text-3xl font-semibold tabular-nums leading-none">{value}</p>
      <div className="flex items-center justify-between text-xs">
        {hint && <p className="text-ink-400">{hint}</p>}
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 font-mono font-semibold',
              trend.dir === 'up' ? 'text-moss' : 'text-rust',
            )}
          >
            {trend.dir === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend.label}
          </span>
        )}
      </div>
    </div>
  )
}
