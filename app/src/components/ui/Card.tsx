import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'ticket' | 'ghost' | 'dark'
}

export function Card({ className, variant = 'default', ...rest }: Props) {
  const variants: Record<string, string> = {
    default: 'card p-5',
    ticket: 'ticket p-5',
    ghost: 'rounded-2xl border border-dashed border-navy/20 p-5',
    dark: 'rounded-2xl bg-navy p-5 text-cream',
  }
  return <div className={cn(variants[variant], className)} {...rest} />
}
