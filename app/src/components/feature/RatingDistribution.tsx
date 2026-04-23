import type { Resena } from '@/types'
import { Star } from 'lucide-react'

interface Props {
  resenas: Resena[]
}

export function RatingDistribution({ resenas }: Props) {
  const total = resenas.length || 1
  const buckets = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: resenas.filter((r) => Math.round(r.estrellas) === n).length,
  }))
  const avg = resenas.length ? resenas.reduce((s, r) => s + r.estrellas, 0) / resenas.length : 0

  return (
    <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="flex flex-col items-start gap-1">
        <p className="font-display text-6xl font-semibold tabular-nums leading-none">{avg.toFixed(1)}</p>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={n <= Math.round(avg) ? 'h-4 w-4 fill-ember text-ember' : 'h-4 w-4 text-ink-300'}
            />
          ))}
        </div>
        <p className="text-xs text-ink-400">{resenas.length} reseña{resenas.length === 1 ? '' : 's'}</p>
      </div>
      <ul className="space-y-1.5">
        {buckets.map((b) => {
          const pct = (b.count / total) * 100
          return (
            <li key={b.n} className="flex items-center gap-3 text-xs">
              <span className="inline-flex w-6 items-center gap-1 font-mono tabular-nums">
                {b.n}
                <Star className="h-3 w-3 fill-ember text-ember" />
              </span>
              <span className="h-1.5 flex-1 rounded-full bg-ink-100 overflow-hidden">
                <span className="block h-full bg-ember" style={{ width: `${pct}%` }} />
              </span>
              <span className="w-8 tabular-nums text-ink-500 text-right">{b.count}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
