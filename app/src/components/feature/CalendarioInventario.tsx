import { useMemo, useState } from 'react'
import { addDays, format, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Herramienta, Contratacion, BloqueoCalendario } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Props {
  herramientas: Herramienta[]
  contrataciones: Contratacion[]
  bloqueos: BloqueoCalendario[]
  dias?: number
}

type EstadoCelda = 'disponible' | 'arrendada' | 'mantenimiento' | 'disputa'

const toneMap: Record<EstadoCelda, string> = {
  disponible: 'bg-moss/15 text-moss',
  arrendada: 'bg-ember/20 text-ember-600',
  mantenimiento: 'bg-ink-200 text-ink-500',
  disputa: 'bg-rust/15 text-rust',
}

export function CalendarioInventario({ herramientas, contrataciones, bloqueos, dias = 14 }: Props) {
  const [offsetWeeks, setOffsetWeeks] = useState(0)
  const base = useMemo(
    () => startOfWeek(new Date(new Date().getTime() + offsetWeeks * 7 * 86400000), { weekStartsOn: 1 }),
    [offsetWeeks],
  )
  const rangoDias = Array.from({ length: dias }, (_, i) => addDays(base, i))

  function estadoDe(h: Herramienta, d: Date): EstadoCelda {
    const iso = format(d, 'yyyy-MM-dd')
    const conflictoBloqueo = bloqueos.some(
      (b) => b.herramientaId === h.id && iso >= b.desde && iso <= b.hasta,
    )
    if (conflictoBloqueo) return 'mantenimiento'
    const contra = contrataciones.find(
      (c) => c.itemId === h.id && iso >= c.fechaInicio.slice(0, 10) && (!c.fechaFin || iso <= c.fechaFin.slice(0, 10)),
    )
    if (contra) {
      if (contra.estado === 'en_disputa') return 'disputa'
      if (['pago_en_escrow', 'en_ejecucion', 'finalizada_pendiente_aprobacion'].includes(contra.estado))
        return 'arrendada'
    }
    return 'disponible'
  }

  return (
    <div className="card p-4 overflow-x-auto">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOffsetWeeks((o) => o - 1)}
          className="btn-ghost btn-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Semana anterior
        </button>
        <p className="font-display text-sm font-semibold">
          {format(rangoDias[0], 'd MMM', { locale: es })} — {format(rangoDias[dias - 1], 'd MMM', { locale: es })}
        </p>
        <button
          type="button"
          onClick={() => setOffsetWeeks((o) => o + 1)}
          className="btn-ghost btn-sm"
        >
          Siguiente <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <table className="min-w-full text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white p-2 text-left font-mono font-semibold uppercase text-ink-500">
              Herramienta
            </th>
            {rangoDias.map((d) => (
              <th key={d.toISOString()} className="p-1 text-center font-mono text-[10px] uppercase text-ink-500">
                {format(d, 'EEEEEE d', { locale: es })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {herramientas.map((h) => (
            <tr key={h.id} className="border-t border-ink-100">
              <th className="sticky left-0 bg-white py-2 pr-3 text-left align-top">
                <p className="font-semibold truncate max-w-[160px]">{h.titulo}</p>
                <p className="text-[10px] text-ink-400">{h.marca}</p>
              </th>
              {rangoDias.map((d) => {
                const e = estadoDe(h, d)
                return (
                  <td key={d.toISOString()} className="p-0.5 text-center">
                    <span className={cn('inline-block h-7 w-full min-w-[32px] rounded-md text-[10px] leading-7 font-semibold', toneMap[e])}>
                      {e === 'arrendada' ? '•' : e === 'mantenimiento' ? '×' : e === 'disputa' ? '!' : ''}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-ink-500">
        <Legend tone="moss" label="Disponible" />
        <Legend tone="ember" label="Arrendada" />
        <Legend tone="ink" label="Mantenimiento" />
        <Legend tone="rust" label="Disputa" />
      </div>
    </div>
  )
}

function Legend({ tone, label }: { tone: 'moss' | 'ember' | 'ink' | 'rust'; label: string }) {
  const map: Record<typeof tone, string> = {
    moss: 'bg-moss/60',
    ember: 'bg-ember/80',
    ink: 'bg-ink-300',
    rust: 'bg-rust/70',
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('inline-block h-3 w-6 rounded', map[tone])} />
      {label}
    </span>
  )
}
