import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useAuth } from '@/stores/useAuth'
import { useNotificaciones } from '@/stores/useNotificaciones'
import { Bell, MessageCircle, ShieldCheck, Star, FileText, AlertTriangle } from 'lucide-react'
import { formatRelative } from '@/lib/format'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import type { TipoNotificacion } from '@/types'
import type { ComponentType } from 'react'

const icons: Record<TipoNotificacion, ComponentType<{ className?: string }>> = {
  nuevo_mensaje: MessageCircle,
  nueva_solicitud: FileText,
  pago_liberado: Star,
  resena_recibida: Star,
  recordatorio: Bell,
  cotizacion_lista: FileText,
  escrow_pagado: ShieldCheck,
  finalizada: AlertTriangle,
}

export function Notificaciones() {
  const user = useAuth((s) => s.user())!
  const items = useNotificaciones(useShallow((s) => s.items.filter((n) => n.usuarioId === user.id)))
  const marcarLeida = useNotificaciones((s) => s.marcarLeida)
  const marcarTodas = useNotificaciones((s) => s.marcarTodasLeidas)

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-ember">Notificaciones</p>
          <h1 className="font-display text-4xl font-semibold">Centro de avisos</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => marcarTodas(user.id)}>
          Marcar todas como leídas
        </Button>
      </header>

      {items.length === 0 ? (
        <EmptyState title="Sin notificaciones" description="Cuando ocurran eventos en tu cuenta aparecerán acá." />
      ) : (
        <ul className="divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-paper">
          {[...items]
            .sort((a, b) => b.fecha.localeCompare(a.fecha))
            .map((n) => {
              const Icon = icons[n.tipo]
              return (
                <li key={n.id}>
                  <Link
                    to={n.link ?? '/panel'}
                    onClick={() => marcarLeida(n.id)}
                    className={cn(
                      'flex items-start gap-3 p-4 transition',
                      n.leida ? 'hover:bg-cream-soft' : 'bg-ember/5 hover:bg-ember/10',
                    )}
                  >
                    <span className={cn('mt-0.5 grid h-9 w-9 place-items-center rounded-full', n.leida ? 'bg-navy/10 text-navy' : 'bg-ember text-cream')}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{n.titulo}</p>
                      <p className="text-sm text-ink-500">{n.texto}</p>
                    </div>
                    <span className="text-xs text-ink-400">{formatRelative(n.fecha)}</span>
                  </Link>
                </li>
              )
            })}
        </ul>
      )}
    </div>
  )
}
