import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { listContratacionesDeUsuario } from '@/lib/queries/contrataciones'
import { useFetch } from '@/hooks/useFetch'
import { getProfilesByIds } from '@/lib/queries/perfiles'
import { listServicios } from '@/lib/queries/servicios'
import { listHerramientas } from '@/lib/queries/herramientas'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { PriceTag } from '@/components/ui/PriceTag'
import { EstadoLabel } from '@/components/feature/EstadoContratacionLabel'
import type { EstadoContratacion, User } from '@/types'
import { cn } from '@/lib/cn'
import { formatRelative } from '@/lib/format'

const tabs: { id: 'todas' | 'activas' | 'finalizadas' | 'canceladas'; label: string; filter: (e: EstadoContratacion) => boolean }[] = [
  { id: 'todas', label: 'Todas', filter: () => true },
  {
    id: 'activas',
    label: 'Activas',
    filter: (e) =>
      !['liberado', 'cancelada', 'en_disputa'].includes(e),
  },
  { id: 'finalizadas', label: 'Finalizadas', filter: (e) => e === 'liberado' },
  { id: 'canceladas', label: 'Canceladas', filter: (e) => e === 'cancelada' || e === 'en_disputa' },
]

export function Contrataciones() {
  const user = useAuth((s) => s.user())!
  const { data: itemsData, loading } = useFetch(
    () => listContratacionesDeUsuario(user.id),
    [user.id],
  )
  const items = itemsData ?? []
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('todas')
  const [profiles, setProfiles] = useState<Record<string, User>>({})
  const [serviciosTitulos, setServiciosTitulos] = useState<Record<string, string>>({})
  const [herramientasTitulos, setHerramientasTitulos] = useState<Record<string, string>>({})

  useEffect(() => {
    if (items.length === 0) return
    const otherIds = Array.from(
      new Set(items.map((c) => (c.clienteId === user.id ? c.ofertanteId : c.clienteId))),
    )
    getProfilesByIds(otherIds).then(setProfiles).catch(() => {})

    const tieneServicios = items.some((c) => c.tipo === 'servicio')
    const tieneHerramientas = items.some((c) => c.tipo === 'arriendo')
    if (tieneServicios) {
      listServicios()
        .then((all) => {
          const map: Record<string, string> = {}
          for (const s of all) map[s.id] = s.oficio
          setServiciosTitulos(map)
        })
        .catch(() => {})
    }
    if (tieneHerramientas) {
      listHerramientas()
        .then((all) => {
          const map: Record<string, string> = {}
          for (const h of all) map[h.id] = h.titulo
          setHerramientasTitulos(map)
        })
        .catch(() => {})
    }
  }, [items, user.id])

  const lista = items.filter((c) => tabs.find((t) => t.id === tab)!.filter(c.estado))

  if (loading) return <div className="text-center text-ink-400 py-12">Cargando…</div>

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase text-ember">Contrataciones</p>
        <h1 className="font-display text-4xl font-semibold">Tus trabajos en curso</h1>
      </header>

      <nav className="flex gap-1 border-b border-navy/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn('relative px-4 py-3 text-sm font-semibold transition', tab === t.id ? 'text-navy' : 'text-ink-400 hover:text-navy')}
          >
            {t.label}
            {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-ember" />}
          </button>
        ))}
      </nav>

      {lista.length === 0 ? (
        <EmptyState title="Sin contrataciones en esta pestaña" description="Cambia de filtro o crea una nueva contratación." />
      ) : (
        <ul className="space-y-3">
          {lista.map((c) => {
            const otro = profiles[c.clienteId === user.id ? c.ofertanteId : c.clienteId]
            const item =
              c.tipo === 'servicio'
                ? serviciosTitulos[c.itemId]
                : herramientasTitulos[c.itemId]
            return (
              <li key={c.id}>
                <Link to={`/panel/contratacion/${c.id}`} className="card flex items-center gap-4 p-4 hover:border-navy/30">
                  <Avatar src={otro?.fotoPerfil} name={otro?.nombre} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{item ?? 'Contratación'}</p>
                    <p className="text-xs text-ink-400">
                      {c.tipo === 'servicio' ? 'Servicio' : 'Arriendo'} · con {otro?.nombre} · {formatRelative(c.fechaSolicitud)}
                    </p>
                  </div>
                  <EstadoLabel estado={c.estado} />
                  <PriceTag value={c.total} size="sm" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
