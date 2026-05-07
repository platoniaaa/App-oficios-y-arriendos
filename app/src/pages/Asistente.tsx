import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Send, Sparkles, Plus, BookOpen, ChevronRight } from 'lucide-react'
import { useAuth } from '@/stores/useAuth'
import { intents, matchIntent } from '@/features/chatbot/script'
import {
  listConversacionesBot,
  listMensajesBot,
  crearConversacionBot,
  pushMensajeBot,
} from '@/lib/queries/chatbot'
import { getServicio } from '@/lib/queries/servicios'
import { getHerramienta } from '@/lib/queries/herramientas'
import { getProfile } from '@/lib/queries/perfiles'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { PriceTag } from '@/components/ui/PriceTag'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { formatCLP } from '@/lib/format'
import { brand } from '@/config/brand'
import type { ChatbotBlock, ConversacionBot, MensajeChatbot, ServicioOficio, Herramienta, User } from '@/types'

const saludo = `Hola 👋 Cuéntame qué proyecto tienes en mente. Puedo ayudarte a encontrar al maestro indicado y las herramientas que necesitas — desde una reparación simple hasta una obra completa.`

function makeLocalId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function Asistente() {
  const user = useAuth((s) => s.user())
  const [conversaciones, setConversaciones] = useState<ConversacionBot[]>([])
  const [actualId, setActualId] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<MensajeChatbot[]>([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [flow, setFlow] = useState<{ intentId: string; pasoId: string } | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  // Carga inicial: lista de conversaciones del usuario (si está logueado)
  useEffect(() => {
    let cancelled = false
    async function init() {
      if (user) {
        try {
          const convs = await listConversacionesBot(user.id)
          if (cancelled) return
          if (convs.length > 0) {
            setConversaciones(convs)
            setActualId(convs[0].id)
          } else {
            const c = await crearConversacionBot(user.id, 'Nueva conversación')
            const greeting = await pushMensajeBot(c.id, 'bot', saludo)
            if (cancelled) return
            setConversaciones([{ ...c, mensajes: [greeting] }])
            setActualId(c.id)
            setMensajes([greeting])
          }
        } catch (err) {
          console.error(err)
        }
      } else {
        // Invitado: conversación efímera en memoria
        const id = makeLocalId('bot')
        const greet: MensajeChatbot = {
          id: makeLocalId('mb'),
          rol: 'bot',
          texto: saludo,
          fecha: new Date().toISOString(),
        }
        const conv: ConversacionBot = {
          id,
          titulo: 'Nueva conversación',
          creada: new Date().toISOString(),
          mensajes: [greet],
        }
        setConversaciones([conv])
        setActualId(id)
        setMensajes([greet])
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  // Cuando se cambia de conversación, cargar sus mensajes
  useEffect(() => {
    if (!actualId || !user) return
    const cached = conversaciones.find((c) => c.id === actualId)
    if (cached && cached.mensajes.length > 0) {
      setMensajes(cached.mensajes)
      return
    }
    let cancelled = false
    listMensajesBot(actualId)
      .then((ms) => {
        if (cancelled) return
        setMensajes(ms)
        setConversaciones((prev) =>
          prev.map((c) => (c.id === actualId ? { ...c, mensajes: ms } : c)),
        )
      })
      .catch((e) => console.error(e))
    return () => {
      cancelled = true
    }
  }, [actualId, user?.id])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensajes.length, typing])

  async function persistMsg(
    rol: 'user' | 'bot',
    texto: string,
    componentes?: ChatbotBlock[],
  ): Promise<MensajeChatbot> {
    if (user && actualId) {
      try {
        return await pushMensajeBot(actualId, rol, texto, componentes)
      } catch (err) {
        console.error('No se pudo guardar mensaje', err)
      }
    }
    return {
      id: makeLocalId('mb'),
      rol,
      texto,
      componentes,
      fecha: new Date().toISOString(),
    }
  }

  function appendMsg(m: MensajeChatbot) {
    setMensajes((prev) => [...prev, m])
    setConversaciones((prev) =>
      prev.map((c) => (c.id === actualId ? { ...c, mensajes: [...c.mensajes, m] } : c)),
    )
  }

  async function runPaso(intentId: string, pasoId: string) {
    const intent = intents.find((i) => i.id === intentId)
    const paso = intent?.pasos.find((p) => p.id === pasoId)
    if (!intent || !paso) return
    setTyping(true)
    setTimeout(async () => {
      const componentes = paso.bloque ? [paso.bloque] : undefined
      const m = await persistMsg('bot', paso.bot, componentes)
      appendMsg(m)
      setTyping(false)
      if (typeof paso.siguiente === 'string') {
        setFlow({ intentId, pasoId: paso.siguiente })
      } else {
        setFlow(null)
      }
    }, 700)
  }

  async function handleSend(t?: string) {
    const m = (t ?? text).trim()
    if (!m || !actualId) return
    const userMsg = await persistMsg('user', m)
    appendMsg(userMsg)
    setText('')
    if (flow) {
      runPaso(flow.intentId, flow.pasoId)
      return
    }
    const intent = matchIntent(m)
    if (intent) {
      runPaso(intent.id, intent.pasos[0].id)
    } else {
      setTyping(true)
      setTimeout(async () => {
        const fallback = await persistMsg(
          'bot',
          'No estoy seguro de tener suficiente contexto. ¿Es una remodelación de baño, terraza, instalación eléctrica, mudanza o reparación urgente?',
          [
            {
              kind: 'chips',
              preguntaId: 'sugerencias',
              opciones: intents.map((i) => ({ id: i.id, label: i.titulo })),
            },
          ],
        )
        appendMsg(fallback)
        setTyping(false)
      }, 700)
    }
  }

  async function onChip(opt: { id: string; label: string }) {
    const intent = intents.find((i) => i.id === opt.id)
    if (intent) {
      const u = await persistMsg('user', opt.label)
      appendMsg(u)
      runPaso(intent.id, intent.pasos[0].id)
      return
    }
    handleSend(opt.label)
  }

  async function nuevaConversacion() {
    setFlow(null)
    if (user) {
      try {
        const c = await crearConversacionBot(user.id, 'Nueva conversación')
        const greet = await pushMensajeBot(c.id, 'bot', saludo)
        const conv: ConversacionBot = { ...c, mensajes: [greet] }
        setConversaciones((prev) => [conv, ...prev])
        setActualId(c.id)
        setMensajes([greet])
      } catch (err) {
        console.error(err)
      }
    } else {
      const id = makeLocalId('bot')
      const greet: MensajeChatbot = {
        id: makeLocalId('mb'),
        rol: 'bot',
        texto: saludo,
        fecha: new Date().toISOString(),
      }
      const conv: ConversacionBot = {
        id,
        titulo: 'Nueva conversación',
        creada: new Date().toISOString(),
        mensajes: [greet],
      }
      setConversaciones((prev) => [conv, ...prev])
      setActualId(id)
      setMensajes([greet])
    }
  }

  const history = useMemo(() => conversaciones, [conversaciones])

  return (
    <div className="container-page py-6 md:py-10">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-ember" />
              <h2 className="font-display text-xl font-semibold">Asistente IA</h2>
            </div>
            <p className="text-sm text-ink-500 mt-2">
              {brand.name} te ayuda a armar tu proyecto: maestros, herramientas y cotización inicial.
            </p>
            <Button
              variant="primary"
              size="md"
              className="mt-4 w-full"
              onClick={() => nuevaConversacion()}
            >
              <Plus className="h-4 w-4" /> Nueva conversación
            </Button>
          </div>

          <div className="card p-5">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
              <BookOpen className="h-4 w-4" /> Sugerencias
            </h3>
            <ul className="mt-3 space-y-2">
              {intents.map((i) => (
                <li key={i.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-navy/10 px-3 py-2 text-sm hover:border-navy/30"
                    onClick={async () => {
                      const u = await persistMsg('user', i.titulo)
                      appendMsg(u)
                      runPaso(i.id, i.pasos[0].id)
                    }}
                  >
                    <span>{i.titulo}</span>
                    <ChevronRight className="h-4 w-4 text-ink-400" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {history.length > 1 && (
            <div className="card p-5">
              <h3 className="font-display text-lg font-semibold">Conversaciones anteriores</h3>
              <ul className="mt-3 space-y-2">
                {history.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setActualId(c.id)}
                      className={cn(
                        'w-full truncate rounded-xl px-3 py-2 text-left text-sm hover:bg-cream-soft',
                        actualId === c.id && 'bg-cream-soft font-semibold',
                      )}
                    >
                      {c.titulo}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <section className="flex h-[calc(100vh-10rem)] flex-col rounded-2xl border-2 border-navy bg-paper shadow-ticket-sm">
          <header className="flex items-center gap-2 border-b border-navy/10 px-5 py-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ember text-cream">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">Asistente {brand.name}</p>
              <p className="text-xs text-ink-400">Asistente guionado · respuestas referenciales</p>
            </div>
          </header>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-5">
            {mensajes.map((m) => (
              <MessageItem key={m.id} msg={m} onChip={onChip} />
            ))}
            {typing && (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-cream-soft px-4 py-2 text-sm text-ink-400">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-ink-400" />
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-ink-400 [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-ink-400 [animation-delay:0.4s]" />
                </span>
                está escribiendo
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2 border-t border-navy/10 p-3"
          >
            <input
              className="input-base flex-1"
              placeholder="Describe tu proyecto… ej: quiero remodelar un baño"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" className="btn-ember btn-md rounded-full" disabled={!text.trim() || typing}>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

function MessageItem({ msg, onChip }: { msg: MensajeChatbot; onChip: (opt: { id: string; label: string }) => void }) {
  const isBot = msg.rol === 'bot'
  return (
    <div className={cn('flex', isBot ? 'justify-start' : 'justify-end')}>
      <div className={cn('max-w-[80%] space-y-3', isBot ? '' : '')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2 shadow-soft',
            isBot ? 'rounded-bl-sm bg-cream-soft border border-navy/10' : 'rounded-br-sm bg-navy text-cream',
          )}
        >
          <p className="text-sm whitespace-pre-line">{msg.texto}</p>
        </div>
        {msg.componentes?.map((b, i) => <BlockRenderer key={i} block={b} onChip={onChip} />)}
      </div>
    </div>
  )
}

function BlockRenderer({ block, onChip }: { block: ChatbotBlock; onChip: (opt: { id: string; label: string }) => void }) {
  if (block.kind === 'chips') {
    return (
      <div className="flex flex-wrap gap-2">
        {block.opciones.map((o) => (
          <button key={o.id} type="button" onClick={() => onChip(o)} className="chip border-navy/40 hover:bg-navy hover:text-cream transition">
            {o.label}
          </button>
        ))}
      </div>
    )
  }
  if (block.kind === 'workers') {
    return <WorkersBlock ids={block.trabajadorIds} />
  }
  if (block.kind === 'tools') {
    return <ToolsBlock ids={block.herramientaIds} />
  }
  if (block.kind === 'cotizacion') {
    return (
      <div className="ticket p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">Cotización inicial</p>
          <span className="stamp">#{Math.floor(Math.random() * 10000)}</span>
        </div>
        <h4 className="font-display text-xl font-semibold">{block.titulo}</h4>
        <ul className="mt-3 divide-y divide-navy/10">
          {block.items.map((it, i) => (
            <li key={i} className="flex items-start justify-between py-2 text-sm">
              <div>
                <p className="font-semibold">{it.label}</p>
                {it.detalle && <p className="text-xs text-ink-400">{it.detalle}</p>}
                {it.cantidad && it.cantidad > 1 && (
                  <p className="text-xs text-ink-400">× {it.cantidad}</p>
                )}
              </div>
              <p className="tabular-nums">{formatCLP(it.monto * (it.cantidad ?? 1))}</p>
            </li>
          ))}
        </ul>
        <div className="rule-dashed my-3" />
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatCLP(block.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-ink-500">
          <span>Comisión plataforma</span>
          <span>{formatCLP(block.comision)}</span>
        </div>
        <div className="mt-2 flex justify-between font-display text-xl font-semibold">
          <span>Total estimado</span>
          <span>{formatCLP(block.total)}</span>
        </div>
        <Button variant="ember" size="lg" className="mt-4 w-full">
          Guardar / enviar cotización
        </Button>
      </div>
    )
  }
  return null
}

function WorkersBlock({ ids }: { ids: string[] }) {
  const [items, setItems] = useState<Array<{ servicio: ServicioOficio; user: User | null }>>([])
  useEffect(() => {
    let cancelled = false
    Promise.all(
      ids.map(async (id) => {
        try {
          const s = await getServicio(id)
          if (!s) return null
          const u = await getProfile(s.trabajadorId).catch(() => null)
          return { servicio: s, user: u }
        } catch {
          return null
        }
      }),
    ).then((res) => {
      if (cancelled) return
      setItems(res.filter((x): x is { servicio: ServicioOficio; user: User | null } => x !== null))
    })
    return () => {
      cancelled = true
    }
  }, [ids])

  if (items.length === 0) return null
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(({ servicio: s, user: u }) => (
        <div key={s.id} className="card flex items-start gap-3 p-4">
          <Avatar src={u?.fotoPerfil} name={u?.nombre} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{u?.nombre ?? 'Profesional'}</p>
            <p className="text-xs text-ink-400">{s.oficio}</p>
            <StarRating value={s.calificacion} count={s.totalTrabajosRealizados} size="sm" />
            {s.tarifaReferencia.monto && (
              <PriceTag value={s.tarifaReferencia.monto} unit={s.tarifaReferencia.tipo} size="sm" className="mt-1" />
            )}
          </div>
          <Link to={`/servicio/${s.id}`} className="btn-outline btn-sm">
            Ver perfil
          </Link>
        </div>
      ))}
    </div>
  )
}

function ToolsBlock({ ids }: { ids: string[] }) {
  const [items, setItems] = useState<Herramienta[]>([])
  useEffect(() => {
    let cancelled = false
    Promise.all(ids.map((id) => getHerramienta(id).catch(() => null))).then((res) => {
      if (cancelled) return
      setItems(res.filter((x): x is Herramienta => x !== null))
    })
    return () => {
      cancelled = true
    }
  }, [ids])

  if (items.length === 0) return null
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((h) => (
        <div key={h.id} className="card flex items-center gap-3 p-3">
          <img src={h.fotos[0]} alt="" className="h-16 w-16 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{h.titulo}</p>
            <PriceTag value={h.tarifa.porDia} unit="día" size="sm" />
          </div>
          <Link to={`/herramienta/${h.id}`} className="btn-ghost btn-sm">
            Ver
          </Link>
        </div>
      ))}
    </div>
  )
}
