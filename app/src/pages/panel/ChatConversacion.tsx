import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { useChat } from '@/stores/useChat'
import { useContrataciones } from '@/stores/useContrataciones'
import { usersById } from '@/mocks/users'
import { Avatar } from '@/components/ui/Avatar'
import { Send, Paperclip, ArrowLeft, FileText } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatRelative } from '@/lib/format'

export function ChatConversacion() {
  const { id } = useParams()
  const user = useAuth((s) => s.user())!
  const { conversaciones, mensajes, enviar, simularRespuesta, marcarLeidos } = useChat()
  const contratacion = useContrataciones((s) => s.items.find((c) => c.id === (conversaciones.find((cv) => cv.id === id)?.contratacionId ?? '')))
  const [texto, setTexto] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)

  const conv = conversaciones.find((c) => c.id === id)
  const msgs = useMemo(
    () => mensajes.filter((m) => m.conversacionId === id).sort((a, b) => a.fecha.localeCompare(b.fecha)),
    [mensajes, id],
  )

  useEffect(() => {
    if (id) marcarLeidos(id)
  }, [id, marcarLeidos])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs.length])

  if (!id || !conv) return <Navigate to="/panel/chats" replace />

  const otroId = conv.participantes.find((p) => p !== user.id)!
  const otro = usersById[otroId]

  function onSend(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    enviar(id!, user.id, texto.trim())
    setTexto('')
    simularRespuesta(id!, user.id)
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-2xl border-2 border-navy bg-paper shadow-ticket-sm">
      <header className="flex items-center gap-3 border-b border-navy/10 p-4">
        <Link to="/panel/chats" className="md:hidden rounded-full p-1 hover:bg-navy/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Avatar src={otro?.fotoPerfil} name={otro?.nombre} size="md" />
        <div className="min-w-0 flex-1">
          <Link to={`/perfil/${otro?.id}`} className="font-semibold hover:underline">{otro?.nombre}</Link>
          <p className="text-xs text-ink-400">En línea hace poco</p>
        </div>
      </header>

      {contratacion && (
        <Link
          to={`/panel/contratacion/${contratacion.id}`}
          className="flex items-center gap-2 border-b border-navy/10 bg-ember/10 px-4 py-2 text-xs font-semibold text-ember-600 hover:bg-ember/20"
        >
          <FileText className="h-4 w-4" />
          Conversación vinculada a la contratación #{contratacion.id}
        </Link>
      )}

      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto bg-grain bg-cream-soft/50 p-4">
        {msgs.map((m) => {
          const mine = m.emisorId === user.id
          return (
            <div
              key={m.id}
              className={cn('flex items-end gap-2', mine ? 'justify-end' : 'justify-start')}
            >
              {!mine && <Avatar src={otro?.fotoPerfil} name={otro?.nombre} size="xs" />}
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2 shadow-soft',
                  mine ? 'rounded-br-sm bg-navy text-cream' : 'rounded-bl-sm bg-paper border border-navy/10',
                )}
              >
                <p className="text-sm whitespace-pre-line">{m.texto}</p>
                <p className={cn('mt-1 text-[10px] font-mono', mine ? 'text-cream/60' : 'text-ink-400')}>
                  {formatRelative(m.fecha)}
                </p>
              </div>
            </div>
          )
        })}
        {msgs.length === 0 && (
          <p className="text-center text-sm text-ink-400 italic py-10">Envía el primer mensaje para iniciar la conversación.</p>
        )}
      </div>

      <form onSubmit={onSend} className="flex items-center gap-2 border-t border-navy/10 p-3">
        <button type="button" className="rounded-full p-2 text-navy hover:bg-navy/5">
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          className="input-base flex-1"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje…"
        />
        <button type="submit" className="btn-ember btn-md rounded-full" disabled={!texto.trim()}>
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
