import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAuth } from '@/stores/useAuth'
import { useResenas } from '@/stores/useResenas'
import { usersById } from '@/mocks/users'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { formatRelative } from '@/lib/format'

export function Resenas() {
  const user = useAuth((s) => s.user())!
  const recibidas = useResenas(useShallow((s) => s.paraUsuario(user.id)))
  const dadas = useResenas(useShallow((s) => s.dePorAutor(user.id)))
  const [tab, setTab] = useState<'recibidas' | 'dadas'>('recibidas')
  const lista = tab === 'recibidas' ? recibidas : dadas

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase text-ember">Reseñas</p>
        <h1 className="font-display text-4xl font-semibold">Historial de reseñas</h1>
      </header>

      <nav className="flex gap-1 border-b border-navy/10">
        {([
          ['recibidas', `Recibidas (${recibidas.length})`],
          ['dadas', `Enviadas (${dadas.length})`],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn('relative px-4 py-3 text-sm font-semibold transition', tab === id ? 'text-navy' : 'text-ink-400 hover:text-navy')}
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
          {lista
            .sort((a, b) => b.fecha.localeCompare(a.fecha))
            .map((r) => {
              const otro = usersById[tab === 'recibidas' ? r.autorId : r.destinoId]
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
