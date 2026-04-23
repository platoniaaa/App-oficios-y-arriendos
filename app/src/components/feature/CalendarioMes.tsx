import { useState } from 'react'
import { addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export type EstadoDia = 'libre' | 'confirmado' | 'tentativo' | 'bloqueado'

interface Props {
  estado: (d: Date) => EstadoDia
  onSelect?: (d: Date) => void
  onToggleBloqueo?: (d: Date) => void
}

const toneMap: Record<EstadoDia, string> = {
  libre: 'bg-white text-ink-500 hover:bg-ink-100',
  confirmado: 'bg-moss/10 text-moss border border-moss/40',
  tentativo: 'bg-ember/10 text-ember-600 border border-ember/40',
  bloqueado: 'bg-ink-100 text-ink-400 line-through',
}

export function CalendarioMes({ estado, onSelect, onToggleBloqueo }: Props) {
  const [cursor, setCursor] = useState(new Date())
  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
  const days: Date[] = []
  for (let d = start; d <= end; d = new Date(d.getTime() + 86400000)) days.push(new Date(d))
  const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, -1))}
          className="rounded-full p-1 hover:bg-ink-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-display text-lg font-semibold capitalize">
          {format(cursor, 'MMMM yyyy', { locale: es })}
        </p>
        <button
          type="button"
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="rounded-full p-1 hover:bg-ink-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono uppercase text-ink-400 mb-1">
        {weekdays.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const dim = !isSameMonth(d, cursor)
          const st = estado(d)
          const today = isSameDay(d, new Date())
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => {
                if (onSelect) onSelect(d)
                if (onToggleBloqueo) onToggleBloqueo(d)
              }}
              className={cn(
                'aspect-square rounded-lg text-xs font-semibold tabular-nums transition',
                toneMap[st],
                dim && 'opacity-40',
                today && 'ring-2 ring-ember ring-offset-2 ring-offset-white',
              )}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-ink-500">
        <Legend tone="moss" label="Confirmado" />
        <Legend tone="ember" label="Tentativo" />
        <Legend tone="ink" label="Bloqueado" />
        <Legend tone="none" label="Libre" />
      </div>
    </div>
  )
}

function Legend({ tone, label }: { tone: 'moss' | 'ember' | 'ink' | 'none'; label: string }) {
  const map: Record<typeof tone, string> = {
    moss: 'bg-moss',
    ember: 'bg-ember',
    ink: 'bg-ink-200',
    none: 'border border-ink-200 bg-white',
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('inline-block h-3 w-3 rounded', map[tone])} />
      {label}
    </span>
  )
}
