import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRelative } from '@/lib/format'
import {
  listConversaciones,
  subscribeToConversaciones,
} from '@/lib/queries/chat'
import { getProfilesByIds } from '@/lib/queries/perfiles'
import type { Conversacion, User } from '@/types'

export function Chats() {
  const user = useAuth((s) => s.user())!
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
  const [perfilesById, setPerfilesById] = useState<Record<string, User>>({})
  const [loading, setLoading] = useState(true)

  async function load() {
    const lista = await listConversaciones(user.id)
    setConversaciones(lista)
    const otros = lista.map((c) => c.participantes.find((p) => p !== user.id)!).filter(Boolean)
    setPerfilesById(await getProfilesByIds(otros))
    setLoading(false)
  }

  useEffect(() => {
    load()
    const unsub = subscribeToConversaciones(user.id, () => load())
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  if (loading) return <div className="text-center text-ink-400 py-12">Cargando…</div>

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase text-ember">Chat</p>
        <h1 className="font-display text-4xl font-semibold">Tus conversaciones</h1>
      </header>
      {conversaciones.length === 0 ? (
        <EmptyState
          title="Sin conversaciones"
          description="Cuando contactes a alguien aparecerá aquí."
        />
      ) : (
        <ul className="divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-paper">
          {conversaciones.map((c) => {
            const otroId = c.participantes.find((p) => p !== user.id)!
            const otro = perfilesById[otroId]
            return (
              <li key={c.id}>
                <Link
                  to={`/panel/chats/${c.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-cream-soft"
                >
                  <Avatar src={otro?.fotoPerfil} name={otro?.nombre} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{otro?.nombre ?? 'Usuario'}</p>
                    <p className="truncate text-sm text-ink-500">{c.ultimoMensaje ?? '—'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-ink-400">{formatRelative(c.ultimoMensajeFecha)}</p>
                    {c.noLeidos > 0 && (
                      <span className="mt-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1.5 text-[10px] font-bold text-cream">
                        {c.noLeidos}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
