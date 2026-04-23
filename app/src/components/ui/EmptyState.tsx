import type { ReactNode } from 'react'
import { PackageOpen } from 'lucide-react'

interface Props {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-navy/20 bg-cream-soft px-6 py-12 text-center">
      <div className="rounded-full bg-navy/5 p-4 text-navy/60">
        {icon ?? <PackageOpen className="h-8 w-8" />}
      </div>
      <h3 className="font-display text-xl text-navy">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-500">{description}</p>}
      {action}
    </div>
  )
}
