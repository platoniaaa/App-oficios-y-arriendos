import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { Send, Paperclip, ArrowLeft, FileText } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatRelative } from '@/lib/format'
import {
  getConversacion,
  listMensajes,
  enviarMensaje,
  marcarLeidos,
  subscribeToMensajes,
} from '@/lib/queries/chat'
import { getContratacion } from '@/lib/queries/contrataciones'
import { getProfile } from '@/lib/queries/perfiles'
import type { Conversacion, MensajeChat, User, Contratacion } from '@/types'

export function ChatConversacion() {
  const { id } = useParams()
  const user = useAuth((s) => s.user())!
  const [conv, setConv] = useState<Conversacion | null>(null)
  const [otro, setOtro] = useState<User | null>(null)
  const [contratacion, setContratacion] = useState<Contratacion | null>(null)
  const [msgs, setMsgs] = useState<MensajeChat[]>([])
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!id) return
    let unsub: (() => void) | undefined
    ;(async () => {
      const c = await getConversacion(id, user.id)
      if (!c) {
        setLoading(false)
        return
      }
      setConv(c)
      const otroId = c.participantes.find((p) => p !== user.id)!
      const [perfil, mensajesIniciales, contr] = await Promise.all([
        getProfile(otroId),
        listMensajes(c.id),
        c.contratacionId ? getContratacion(c.contratacionId) : Promise.resolve(null),
      ])
      setOtro(perfil)
      setMsgs(mensajesIniciales)
      setContratacion(contr)
      setLoading(false)
      await marcarLeidos(c.id, user.id)
      unsub = subscribeToMensajes(c.id, (m) => {
        setMsgs((prev) => (prev.find((x) => x.id === m.id) ? prev : [...prev, m]))
        if (m.emisorId !== user.id) marcarLeidos(c.id, user.id)
      })
    })()
    return () => unsub?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user.id])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs.length])

  if (loading) return <div className="text-center text-ink-400 py-12">Cargando…</div>
  if (!id || !conv) return <Navigate to="/panel/chats" replace />

  async function onSend(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim() || !conv || sending) return
    const t = texto.trim()
    setTexto('')
    setSendError(null)
    setSending(true)
    // Optimistic update: muestra el mensaje al instante con un id temporal
    const tempId = `temp-${Date.now()}`
    const optimistic: MensajeChat = {
      id: tempId,
      conversacionId: conv.id,
      emisorId: user.id,
      texto: t,
      fecha: new Date().toISOString(),
      leido: false,
    }
    setMsgs((prev) => [...prev, optimistic])
    try {
      const real = await enviarMensaje(conv.id, user.id, t)
      // Quita el optimistic; si Realtime ya entregó el real, no duplicar.
      setMsgs((prev) => {
        const sinTemp = prev.filter((m) => m.id !== tempId)
        if (sinTemp.find((m) => m.id === real.id)) return sinTemp
        return [...sinTemp, real]
      })
    } catch (err) {
      console.error('[ChatConversacion.onSend]', err)
      // Quita el optimistic y restaura el texto
      setMsgs((prev) => prev.filter((m) => m.id !== tempId))
      setTexto(t)
      setSendError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-2xl border-2 border-navy bg-paper shadow-ticket-sm">
      <header className="flex items-center gap-3 border-b border-navy/10 p-4">
        <Link to="/panel/chats" className="md:hidden rounded-full p-1 hover:bg-navy/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Avatar src={otro?.fotoPerfil} name={otro?.nombre} size="md" />
        <div className="min-w-0 flex-1">
          <Link to={`/perfil/${otro?.id}`} className="font-semibold hover:underline">
            {otro?.nombre ?? 'Usuario'}
          </Link>
          <p className="text-xs text-ink-400">En línea hace poco</p>
        </div>
      </header>

      {contratacion && (
        <Link
          to={`/panel/contratacion/${contratacion.id}`}
          className="flex items-center gap-2 border-b border-navy/10 bg-ember/10 px-4 py-2 text-xs font-semibold text-ember-600 hover:bg-ember/20"
        >
          <FileText className="h-4 w-4" />
          Conversación vinculada a la contratación
        </Link>
      )}

      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto bg-cream-soft/50 p-4">
        {msgs.map((m) => {
          const mine = m.emisorId === user.id
          return (
            <div key={m.id} className={cn('flex items-end gap-2', mine ? 'justify-end' : 'justify-start')}>
              {!mine && <Avatar src={otro?.fotoPerfil} name={otro?.nombre} size="xs" />}
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2 shadow-soft',
                  mine
                    ? 'rounded-br-sm bg-navy text-cream'
                    : 'rounded-bl-sm bg-paper border border-navy/10',
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
          <p className="text-center text-sm text-ink-400 italic py-10">
            Envía el primer mensaje para iniciar la conversación.
          </p>
        )}
      </div>

      {sendError && (
        <div className="border-t border-rust/20 bg-rust/5 px-4 py-2 text-xs text-rust">
          <strong>No se envió:</strong> {sendError}
        </div>
      )}
      <form onSubmit={onSend} className="flex items-center gap-2 border-t border-navy/10 p-3">
        <button type="button" className="rounded-full p-2 text-navy hover:bg-navy/5">
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          className="input-base flex-1"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje…"
          disabled={sending}
        />
        <button
          type="submit"
          className="btn-ember btn-md rounded-full"
          disabled={!texto.trim() || sending}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
