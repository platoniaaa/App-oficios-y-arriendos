import { useState } from 'react'
import { useAuth } from '@/stores/useAuth'
import { useContrataciones } from '@/stores/useContrataciones'
import { horarioDefault, bloqueosDeUsuario } from '@/mocks/agenda'
import { CalendarioMes, type EstadoDia } from '@/components/feature/CalendarioMes'
import { format } from 'date-fns'
import { Input } from '@/components/ui/Input'
import type { DiaSemana, HorarioLaboral } from '@/types'
import { Button } from '@/components/ui/Button'
import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/cn'

export function PrestadorAgenda() {
  const user = useAuth((s) => s.user())!
  const contrs = useContrataciones((s) => s.items.filter((c) => c.ofertanteId === user.id))
  const [bloqueos, setBloqueos] = useState(bloqueosDeUsuario(user.id).map((b) => ({ desde: b.desde, hasta: b.hasta })))
  const [horario, setHorario] = useState<HorarioLaboral[]>(horarioDefault)

  function estadoDia(d: Date): EstadoDia {
    const iso = format(d, 'yyyy-MM-dd')
    if (bloqueos.some((b) => iso >= b.desde && iso <= b.hasta)) return 'bloqueado'
    const match = contrs.find(
      (c) => iso >= c.fechaInicio.slice(0, 10) && (!c.fechaFin || iso <= c.fechaFin.slice(0, 10)),
    )
    if (match) {
      if (['pago_en_escrow', 'en_ejecucion', 'finalizada_pendiente_aprobacion'].includes(match.estado)) return 'confirmado'
      if (['solicitada', 'cotizada', 'aceptada_cliente'].includes(match.estado)) return 'tentativo'
    }
    return 'libre'
  }

  function toggleBloqueo(d: Date) {
    const iso = format(d, 'yyyy-MM-dd')
    setBloqueos((b) =>
      b.some((x) => iso >= x.desde && iso <= x.hasta)
        ? b.filter((x) => !(iso >= x.desde && iso <= x.hasta))
        : [...b, { desde: iso, hasta: iso }],
    )
  }

  const diasNombre: Record<DiaSemana, string> = {
    lun: 'Lunes',
    mar: 'Martes',
    mie: 'Miércoles',
    jue: 'Jueves',
    vie: 'Viernes',
    sab: 'Sábado',
    dom: 'Domingo',
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase text-ember-600">Agenda</p>
        <h1 className="font-display text-3xl font-semibold">Mi calendario</h1>
        <p className="text-sm text-ink-500 mt-1">Clic en un día para bloquear/desbloquear tu disponibilidad.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <CalendarioMes estado={estadoDia} onToggleBloqueo={toggleBloqueo} />

        <div className="card p-5 space-y-4">
          <div>
            <p className="font-mono text-xs uppercase text-ink-400">Horario laboral</p>
            <h3 className="font-display text-lg font-semibold">Días y horas</h3>
          </div>
          <ul className="space-y-2">
            {horario.map((h, i) => (
              <li key={h.dia} className="flex items-center gap-2">
                <label className={cn('flex-1 text-sm font-medium', !h.abierto && 'text-ink-400')}>
                  {diasNombre[h.dia]}
                </label>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-navy"
                  checked={h.abierto}
                  onChange={(e) =>
                    setHorario(horario.map((x, k) => (k === i ? { ...x, abierto: e.target.checked } : x)))
                  }
                />
                {h.abierto ? (
                  <>
                    <Input
                      type="time"
                      value={h.desde ?? '08:00'}
                      onChange={(e) => setHorario(horario.map((x, k) => (k === i ? { ...x, desde: e.target.value } : x)))}
                      wrapClassName="w-24"
                    />
                    <span className="text-ink-400 text-xs">—</span>
                    <Input
                      type="time"
                      value={h.hasta ?? '18:00'}
                      onChange={(e) => setHorario(horario.map((x, k) => (k === i ? { ...x, hasta: e.target.value } : x)))}
                      wrapClassName="w-24"
                    />
                  </>
                ) : (
                  <span className="text-xs text-ink-400">cerrado</span>
                )}
              </li>
            ))}
          </ul>
          <Button variant="primary" size="sm" className="w-full">
            <Check className="h-4 w-4" /> Guardar horario
          </Button>
        </div>
      </div>

      <section>
        <h3 className="font-display text-lg font-semibold mb-3">Bloqueos activos</h3>
        {bloqueos.length === 0 ? (
          <p className="text-sm text-ink-400">No tienes días bloqueados.</p>
        ) : (
          <ul className="space-y-2">
            {bloqueos.map((b, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  <Lock className="h-4 w-4 text-ink-400" />
                  {b.desde === b.hasta ? b.desde : `${b.desde} → ${b.hasta}`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBloqueos(bloqueos.filter((_, k) => k !== i))}
                >
                  Quitar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
