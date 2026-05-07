import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import {
  listContratacionesDeUsuario,
  actualizarEstadoContratacion,
} from '@/lib/queries/contrataciones'
import { useFetch } from '@/hooks/useFetch'
import { usersById } from '@/mocks/users'
import { herramientas } from '@/mocks/herramientas'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { EstadoLabel } from '@/components/feature/EstadoContratacionLabel'
import { EmptyState } from '@/components/ui/EmptyState'
import { ReclamarDepositoModal } from '@/components/feature/ReclamarDepositoModal'
import type { EstadoContratacion } from '@/types'
import { cn } from '@/lib/cn'
import { formatCLP, formatDate, formatRelative } from '@/lib/format'
import { CheckCircle2, XCircle, PackageCheck, AlertTriangle, Truck } from 'lucide-react'

const tabs: { id: string; label: string; filter: (e: EstadoContratacion) => boolean }[] = [
  { id: 'nuevas', label: 'Nuevas solicitudes', filter: (e) => e === 'solicitada' },
  { id: 'aprobadas', label: 'Aprobadas', filter: (e) => e === 'aceptada_cliente' || e === 'pago_en_escrow' },
  { id: 'en-curso', label: 'En curso', filter: (e) => e === 'en_ejecucion' },
  { id: 'devolucion', label: 'Esperando devolución', filter: (e) => e === 'finalizada_pendiente_aprobacion' },
  { id: 'finalizados', label: 'Finalizados', filter: (e) => e === 'liberado' },
  { id: 'disputas', label: 'Disputas', filter: (e) => e === 'en_disputa' || e === 'cancelada' },
]

export function ArrendadorArriendos() {
  const user = useAuth((s) => s.user())!
  const { data: itemsData, refetch } = useFetch(
    () => listContratacionesDeUsuario(user.id),
    [user.id],
  )
  const items = (itemsData ?? []).filter(
    (c) => c.ofertanteId === user.id && c.tipo === 'arriendo',
  )
  const updateEstado = async (id: string, nuevo: EstadoContratacion) => {
    await actualizarEstadoContratacion(id, nuevo)
    refetch()
  }
  const [tab, setTab] = useState('nuevas')
  const [claim, setClaim] = useState<string | null>(null)

  const filtradas = items.filter((c) => tabs.find((t) => t.id === tab)!.filter(c.estado))
  const reclamando = claim ? items.find((c) => c.id === claim) : undefined

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase text-ember-600">Arriendos</p>
        <h1 className="font-display text-3xl font-semibold">Solicitudes y arriendos activos</h1>
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
        <EmptyState title="Sin arriendos en esta pestaña" description="Cambia de filtro o revisa más tarde." />
      ) : (
        <ul className="space-y-3">
          {filtradas.map((c) => {
            const cliente = usersById[c.clienteId]
            const tool = herramientas.find((h) => h.id === c.itemId)
            return (
              <li key={c.id} className="card p-4">
                <div className="flex flex-wrap items-start gap-4">
                  {tool && (
                    <img src={tool.fotos[0]} alt="" className="h-16 w-24 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/herramienta/${tool?.id}`} className="font-semibold hover:text-ember">
                        {tool?.titulo}
                      </Link>
                      <EstadoLabel estado={c.estado} />
                    </div>
                    <p className="text-xs text-ink-400 flex items-center gap-3 mt-1">
                      <Avatar src={cliente?.fotoPerfil} name={cliente?.nombre} size="xs" />
                      <Link to={`/perfil/${cliente?.id}`} className="hover:text-navy">
                        {cliente?.nombre}
                      </Link>
                      <span>· Solicitado {formatRelative(c.fechaSolicitud)}</span>
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      {formatDate(c.fechaInicio)} → {formatDate(c.fechaFin)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-semibold tabular-nums">{formatCLP(c.total)}</p>
                    <p className="text-[11px] text-ink-400">
                      Depósito: {formatCLP(c.deposito ?? 0)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-3">
                  <Link to={`/panel/contratacion/${c.id}`} className="btn-outline btn-sm">
                    Ver detalle
                  </Link>
                  {c.estado === 'solicitada' && (
                    <>
                      <Button variant="ember" size="sm" onClick={() => updateEstado(c.id, 'cotizada')}>
                        <CheckCircle2 className="h-4 w-4" /> Aprobar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => updateEstado(c.id, 'cancelada')}>
                        <XCircle className="h-4 w-4" /> Rechazar
                      </Button>
                    </>
                  )}
                  {c.estado === 'pago_en_escrow' && (
                    <Button variant="primary" size="sm" onClick={() => updateEstado(c.id, 'en_ejecucion')}>
                      <Truck className="h-4 w-4" /> Coordinar entrega
                    </Button>
                  )}
                  {c.estado === 'en_ejecucion' && (
                    <Button variant="ember" size="sm" onClick={() => updateEstado(c.id, 'finalizada_pendiente_aprobacion')}>
                      <PackageCheck className="h-4 w-4" /> Confirmar devolución
                    </Button>
                  )}
                  {c.estado === 'finalizada_pendiente_aprobacion' && (
                    <>
                      <Button variant="ember" size="sm" onClick={() => updateEstado(c.id, 'liberado')}>
                        Liberar depósito
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setClaim(c.id)}>
                        <AlertTriangle className="h-4 w-4" /> Reclamar depósito
                      </Button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {reclamando && (
        <ReclamarDepositoModal
          open={!!reclamando}
          onClose={() => setClaim(null)}
          depositoMax={reclamando.deposito ?? 0}
          onConfirm={() => {
            updateEstado(reclamando.id, 'en_disputa')
            setClaim(null)
          }}
        />
      )}
    </div>
  )
}
