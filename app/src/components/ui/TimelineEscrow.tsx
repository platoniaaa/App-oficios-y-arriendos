import { cn } from '@/lib/cn'
import type { EstadoContratacion } from '@/types'
import {
  ClipboardList,
  FileCheck2,
  ShieldCheck,
  Hammer,
  Package,
  Star,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import type { ComponentType } from 'react'

const flow: {
  key: EstadoContratacion
  label: string
  icon: ComponentType<{ className?: string }>
}[] = [
  { key: 'solicitada', label: 'Solicitud', icon: ClipboardList },
  { key: 'cotizada', label: 'Cotizada', icon: FileCheck2 },
  { key: 'pago_en_escrow', label: 'En escrow', icon: ShieldCheck },
  { key: 'en_ejecucion', label: 'En ejecución', icon: Hammer },
  { key: 'finalizada_pendiente_aprobacion', label: 'Entregada', icon: Package },
  { key: 'liberado', label: 'Pago liberado', icon: Star },
]

export function TimelineEscrow({
  estado,
  orientation = 'auto',
  className,
}: {
  estado: EstadoContratacion
  orientation?: 'auto' | 'horizontal' | 'vertical'
  className?: string
}) {
  if (estado === 'cancelada') {
    return (
      <div className={cn('flex items-center gap-3 rounded-xl bg-rust/10 p-4 text-rust', className)}>
        <XCircle className="h-6 w-6" />
        <div>
          <p className="font-semibold">Contratación cancelada</p>
          <p className="text-xs text-rust/80">Esta contratación fue cancelada.</p>
        </div>
      </div>
    )
  }
  if (estado === 'en_disputa') {
    return (
      <div className={cn('flex items-center gap-3 rounded-xl bg-ember/10 p-4 text-ember-600', className)}>
        <AlertTriangle className="h-6 w-6" />
        <div>
          <p className="font-semibold">En disputa</p>
          <p className="text-xs text-ember-600/80">El equipo de Cuadrilla está mediando el caso.</p>
        </div>
      </div>
    )
  }

  const idxFrom = (k: EstadoContratacion) => {
    const mapping: Partial<Record<EstadoContratacion, number>> = {
      solicitada: 0,
      cotizada: 1,
      aceptada_cliente: 1,
      pago_en_escrow: 2,
      en_ejecucion: 3,
      finalizada_pendiente_aprobacion: 4,
      liberado: 5,
    }
    return mapping[k] ?? 0
  }
  const current = idxFrom(estado)

  const dir = orientation === 'auto' ? 'md:flex-row flex-col' : orientation === 'horizontal' ? 'flex-row' : 'flex-col'
  return (
    <ol className={cn('flex gap-3', dir, className)}>
      {flow.map((step, i) => {
        const done = i < current
        const active = i === current
        const Icon = step.icon
        return (
          <li key={step.key} className="flex flex-1 items-center gap-3">
            <span
              className={cn(
                'grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition',
                done
                  ? 'border-moss bg-moss text-cream'
                  : active
                    ? 'border-ember bg-ember text-cream animate-pulse-dot'
                    : 'border-navy/15 bg-cream text-ink-400',
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-[11px] font-mono font-bold uppercase tracking-wider',
                  active ? 'text-ember-600' : done ? 'text-moss' : 'text-ink-400',
                )}
              >
                Paso {i + 1}
              </p>
              <p
                className={cn(
                  'truncate text-sm font-semibold',
                  active || done ? 'text-navy' : 'text-ink-400',
                )}
              >
                {step.label}
              </p>
            </div>
            {i < flow.length - 1 && (
              <span
                className={cn(
                  'hidden h-0.5 flex-1 md:inline-block',
                  done ? 'bg-moss' : 'bg-navy/10',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
