import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import {
  listContratacionesDeUsuario,
  actualizarEstadoContratacion,
} from '@/lib/queries/contrataciones'
import { useFetch } from '@/hooks/useFetch'
import { usersById } from '@/mocks/users'
import { servicios } from '@/mocks/servicios'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { EstadoLabel } from '@/components/feature/EstadoContratacionLabel'
import { CotizarModal } from '@/components/feature/CotizarModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { formatCLP, formatRelative } from '@/lib/format'
import type { EstadoContratacion } from '@/types'
import { CheckCircle2, XCircle, FileText } from 'lucide-react'

const tabs: { id: string; label: string; filter: (e: EstadoContratacion) => boolean }[] = [
  { id: 'nuevas', label: 'Nuevas', filter: (e) => e === 'solicitada' },
  { id: 'cotizadas', label: 'Cotizadas', filter: (e) => e === 'cotizada' },
  { id: 'aceptadas', label: 'Aceptadas', filter: (e) => e === 'aceptada_cliente' || e === 'pago_en_escrow' },
  { id: 'en-ejecucion', label: 'En ejecución', filter: (e) => e === 'en_ejecucion' || e === 'finalizada_pendiente_aprobacion' },
  { id: 'finalizadas', label: 'Finalizadas', filter: (e) => e === 'liberado' },
  { id: 'canceladas', label: 'Canceladas', filter: (e) => e === 'cancelada' || e === 'en_disputa' },
]

export function PrestadorSolicitudes() {
  const user = useAuth((s) => s.user())!
  const { data: itemsData, refetch } = useFetch(
    () => listContratacionesDeUsuario(user.id),
    [user.id],
  )
  const items = (itemsData ?? []).filter(
    (c) => c.ofertanteId === user.id && c.tipo === 'servicio',
  )
  const updateEstado = async (id: string, nuevo: import('@/types').EstadoContratacion) => {
    await actualizarEstadoContratacion(id, nuevo)
    refetch()
  }
  const [tab, setTab] = useState('nuevas')
  const [cotizandoId, setCotizandoId] = useState<string | null>(null)

  const filtradas = items.filter((c) => tabs.find((t) => t.id === tab)!.filter(c.estado))
  const cotizando = cotizandoId ? items.find((c) => c.id === cotizandoId) : undefined

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase text-ember-600">Solicitudes</p>
        <h1 className="font-display text-3xl font-semibold">Solicitudes de clientes</h1>
      </header>

      <nav className="flex gap-1 overflow-x-auto no-scrollbar border-b border-ink-200">
        {tabs.map((t) => {
          const count = items.filter((c) => t.filter(c.estado)).length
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition',
                tab === t.id ? 'text-navy' : 'text-ink-400 hover:text-navy',
              )}
            >
              {t.label} <span className="ml-1 text-xs text-ink-400">({count})</span>
              {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-ember" />}
            </button>
          )
        })}
      </nav>

      {filtradas.length === 0 ? (
        <EmptyState title="Sin resultados en esta pestaña" description="Cambia de filtro o revisa más tarde." />
      ) : (
        <ul className="space-y-3">
          {filtradas.map((c) => {
            const cliente = usersById[c.clienteId]
            const oficio = servicios.find((s) => s.id === c.itemId)?.oficio
            const esNueva = c.estado === 'solicitada'
            return (
              <li key={c.id} className="card p-4">
                <div className="flex flex-wrap items-start gap-4">
                  <Avatar src={cliente?.fotoPerfil} name={cliente?.nombre} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/perfil/${cliente?.id}`} className="font-semibold hover:text-ember">
                        {cliente?.nombre}
                      </Link>
                      <span className="dot-divider text-xs text-ink-400">
                        <span>{oficio}</span>
                      </span>
                      <EstadoLabel estado={c.estado} />
                    </div>
                    <p className="mt-1 text-xs text-ink-400">Solicitud {formatRelative(c.fechaSolicitud)}</p>
                    {c.descripcionTrabajo && (
                      <p className="mt-3 line-clamp-3 text-sm text-ink-500 flex items-start gap-2">
                        <FileText className="h-4 w-4 text-ink-400 mt-0.5 shrink-0" />
                        <span>{c.descripcionTrabajo}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-semibold tabular-nums">{formatCLP(c.total)}</p>
                    <p className="text-[11px] text-ink-400">monto total</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                  <Link to={`/panel/contratacion/${c.id}`} className="btn-outline btn-sm">
                    Ver detalle
                  </Link>
                  {esNueva && (
                    <>
                      <Button variant="ember" size="sm" onClick={() => setCotizandoId(c.id)}>
                        <CheckCircle2 className="h-4 w-4" /> Cotizar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => updateEstado(c.id, 'cancelada')}>
                        <XCircle className="h-4 w-4" /> Rechazar
                      </Button>
                    </>
                  )}
                  {c.estado === 'pago_en_escrow' && (
                    <Button variant="primary" size="sm" onClick={() => updateEstado(c.id, 'en_ejecucion')}>
                      Iniciar trabajo
                    </Button>
                  )}
                  {c.estado === 'en_ejecucion' && (
                    <Button variant="ember" size="sm" onClick={() => updateEstado(c.id, 'finalizada_pendiente_aprobacion')}>
                      Marcar finalizado
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {cotizando && (
        <CotizarModal
          open={!!cotizando}
          onClose={() => setCotizandoId(null)}
          montoInicial={cotizando.monto}
          onConfirm={(monto) => {
            updateEstado(cotizando.id, 'cotizada')
            // en un backend real actualizaríamos el monto; para mock lo dejamos consistente
            void monto
            setCotizandoId(null)
          }}
        />
      )}
    </div>
  )
}
