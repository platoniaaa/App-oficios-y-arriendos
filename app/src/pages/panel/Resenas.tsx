import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { formatRelative } from '@/lib/format'
import { ArrowRight, Star as StarIcon } from 'lucide-react'
import { listResenasParaUsuario, listResenasDePorAutor } from '@/lib/queries/resenas'
import { getProfilesByIds } from '@/lib/queries/perfiles'
import { listContratacionesDeUsuario } from '@/lib/queries/contrataciones'
import { useFetch } from '@/hooks/useFetch'

export function Resenas() {
  const user = useAuth((s) => s.user())!
  const [tab, setTab] = useState<'recibidas' | 'dadas'>('recibidas')

  const { data, loading } = useFetch(async () => {
    const [recibidas, dadas, contrataciones] = await Promise.all([
      listResenasParaUsuario(user.id),
      listResenasDePorAutor(user.id),
      listContratacionesDeUsuario(user.id),
    ])
    const idsContraparte = new Set<string>()
    recibidas.forEach((r) => idsContraparte.add(r.autorId))
    dadas.forEach((r) => idsContraparte.add(r.destinoId))
    // Pendientes: contrataciones liberadas donde aún no dejé reseña
    const yaReseñadas = new Set(dadas.map((r) => r.contratacionId))
    const pendientes = contrataciones.filter(
      (c) => c.estado === 'liberado' && !yaReseñadas.has(c.id),
    )
    pendientes.forEach((c) =>
      idsContraparte.add(c.clienteId === user.id ? c.ofertanteId : c.clienteId),
    )
    const perfilesById = await getProfilesByIds(Array.from(idsContraparte))
    return { recibidas, dadas, pendientes, perfilesById }
  }, [user.id])

  if (loading) return <div className="text-center text-ink-400 py-12">Cargando…</div>
  const recibidas = data?.recibidas ?? []
  const dadas = data?.dadas ?? []
  const pendientes = data?.pendientes ?? []
  const perfilesById = data?.perfilesById ?? {}
  const lista = tab === 'recibidas' ? recibidas : dadas

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase text-ember">Reseñas</p>
        <h1 className="font-display text-4xl font-semibold">Historial de reseñas</h1>
      </header>

      {pendientes.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <StarIcon className="h-4 w-4 text-ember" />
            <h2 className="font-display text-lg font-semibold">
              Pendientes de reseña ({pendientes.length})
            </h2>
          </div>
          <ul className="space-y-2">
            {pendientes.slice(0, 5).map((c) => {
              const otroId = c.clienteId === user.id ? c.ofertanteId : c.clienteId
              const otro = perfilesById[otroId]
              return (
                <li key={c.id}>
                  <Link
                    to={`/panel/contratacion/${c.id}`}
                    className="card flex items-center gap-3 p-4 hover:border-ember/40"
                  >
                    <Avatar src={otro?.fotoPerfil} name={otro?.nombre} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{otro?.nombre ?? 'Contraparte'}</p>
                      <p className="text-xs text-ink-400">
                        {c.tipo === 'servicio' ? 'Servicio' : 'Arriendo'} · finalizado{' '}
                        {formatRelative(c.fechaSolicitud)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-ember">
                      Calificar <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <nav className="flex gap-1 border-b border-navy/10">
        {(
          [
            ['recibidas', `Recibidas (${recibidas.length})`],
            ['dadas', `Enviadas (${dadas.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'relative px-4 py-3 text-sm font-semibold transition',
              tab === id ? 'text-navy' : 'text-ink-400 hover:text-navy',
            )}
          >
            {label}
            {tab === id && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-ember" />}
          </button>
        ))}
      </nav>

      {lista.length === 0 ? (
        <EmptyState
          title={tab === 'recibidas' ? 'Aún no has recibido reseñas' : 'No has enviado reseñas'}
          description="Al completar una contratación podrás calificar a la otra parte."
        />
      ) : (
        <ul className="space-y-4">
          {[...lista]
            .sort((a, b) => b.fecha.localeCompare(a.fecha))
            .map((r) => {
              const otro = perfilesById[tab === 'recibidas' ? r.autorId : r.destinoId]
              return (
                <li key={r.id} className="card p-5">
                  <div className="flex items-start gap-3">
                    <Avatar src={otro?.fotoPerfil} name={otro?.nombre} size="md" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{otro?.nombre}</p>
                        <StarRating value={r.estrellas} />
                      </div>
                      <p className="text-xs text-ink-400">{formatRelative(r.fecha)}</p>
                      <p className="mt-2 text-sm text-ink-500">{r.comentario}</p>
                    </div>
                  </div>
                </li>
              )
            })}
        </ul>
      )}
    </div>
  )
}
