import { Link } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { servicios } from '@/mocks/servicios'
import { useContrataciones } from '@/stores/useContrataciones'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { StarRating } from '@/components/ui/StarRating'
import { PriceTag } from '@/components/ui/PriceTag'
import { Plus, Edit3, Pause, Copy, Trash2, Eye } from 'lucide-react'

export function PrestadorMisServicios() {
  const user = useAuth((s) => s.user())!
  const mios = servicios.filter((s) => s.trabajadorId === user.id)
  const items = useContrataciones((s) => s.items)

  const contratacionesPorServicio = (sid: string) =>
    items.filter((c) => c.itemId === sid && c.tipo === 'servicio').length

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase text-ember-600">Servicios</p>
          <h1 className="font-display text-3xl font-semibold">Mis servicios publicados</h1>
        </div>
        <Link to="/panel/publicar/servicio" className="btn-ember btn-md">
          <Plus className="h-4 w-4" /> Publicar nuevo servicio
        </Link>
      </header>

      {mios.length === 0 ? (
        <EmptyState
          title="Aún no publicas ningún servicio"
          description="Crea tu primera oferta y empieza a recibir solicitudes de clientes cercanos."
          action={
            <Link to="/panel/publicar/servicio" className="btn-primary btn-md mt-3">
              Publicar servicio
            </Link>
          }
        />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-ink-50 text-left text-[11px] font-mono uppercase text-ink-500">
                <tr>
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3">Oficio</th>
                  <th className="px-4 py-3">Tarifa</th>
                  <th className="px-4 py-3">Vistas</th>
                  <th className="px-4 py-3">Contrataciones</th>
                  <th className="px-4 py-3">Calificación</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {mios.map((s) => (
                  <tr key={s.id} className="hover:bg-ink-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={s.galeriaTrabajos[0]} alt="" className="h-10 w-14 rounded-lg object-cover" />
                        <div>
                          <Link to={`/servicio/${s.id}`} className="font-semibold hover:text-ember">
                            {s.oficio}
                          </Link>
                          <p className="text-[11px] text-ink-400">{s.categorias.slice(0, 2).join(' · ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{s.oficio}</td>
                    <td className="px-4 py-3">
                      {s.tarifaReferencia.monto ? (
                        <PriceTag value={s.tarifaReferencia.monto} unit={s.tarifaReferencia.tipo} size="sm" />
                      ) : (
                        <span className="text-xs text-ink-400">A convenir</span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink-500">{Math.floor(100 + Math.random() * 800)}</td>
                    <td className="px-4 py-3 tabular-nums">{contratacionesPorServicio(s.id)}</td>
                    <td className="px-4 py-3">
                      <StarRating value={s.calificacion} size="sm" count={s.totalTrabajosRealizados} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <ActionBtn icon={Eye} label="Ver" to={`/servicio/${s.id}`} />
                        <ActionBtn icon={Edit3} label="Editar" />
                        <ActionBtn icon={Pause} label="Pausar" />
                        <ActionBtn icon={Copy} label="Duplicar" />
                        <ActionBtn icon={Trash2} label="Eliminar" danger />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function ActionBtn({ icon: Icon, label, to, danger }: { icon: React.ComponentType<{ className?: string }>; label: string; to?: string; danger?: boolean }) {
  const cls =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-ink-100 ' +
    (danger ? 'text-rust hover:bg-rust/10' : 'text-ink-500')
  if (to) {
    return (
      <Link to={to} aria-label={label} className={cls}>
        <Icon className="h-4 w-4" />
      </Link>
    )
  }
  return (
    <Button variant="ghost" size="sm" aria-label={label} className={cls}>
      <Icon className="h-4 w-4" />
    </Button>
  )
}
