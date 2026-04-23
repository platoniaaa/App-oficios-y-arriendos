import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'navy' | 'cream' | 'ember' | 'moss' | 'rust' | 'ink'
  solid?: boolean
  icon?: ReactNode
}

export function Badge({ tone = 'navy', solid, icon, className, children, ...rest }: BadgeProps) {
  const map: Record<string, string> = solid
    ? {
        navy: 'bg-navy text-cream',
        cream: 'bg-cream text-navy border border-navy',
        ember: 'bg-ember text-cream',
        moss: 'bg-moss text-cream',
        rust: 'bg-rust text-cream',
        ink: 'bg-ink-700 text-cream',
      }
    : {
        navy: 'bg-navy/10 text-navy',
        cream: 'bg-cream text-navy border border-navy/20',
        ember: 'bg-ember/15 text-ember-600',
        moss: 'bg-moss/15 text-moss',
        rust: 'bg-rust/10 text-rust',
        ink: 'bg-ink-100 text-ink-700',
      }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        map[tone],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </span>
  )
}

export function VerificationBadge({
  estado,
  label,
}: {
  estado: 'pendiente' | 'validada' | 'rechazada' | 'no_aplica'
  label: string
}) {
  if (estado === 'no_aplica') return null
  if (estado === 'validada') {
    return (
      <Badge tone="moss" icon={<CheckCircle2 className="h-3 w-3" />}>
        {label}
      </Badge>
    )
  }
  if (estado === 'rechazada') {
    return (
      <Badge tone="rust" icon={<XCircle className="h-3 w-3" />}>
        {label}
      </Badge>
    )
  }
  return (
    <Badge tone="ink" icon={<Clock className="h-3 w-3" />}>
      {label} · pendiente
    </Badge>
  )
}
