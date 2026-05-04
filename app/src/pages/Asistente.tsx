import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Send, Sparkles, Plus, BookOpen, ChevronRight } from 'lucide-react'
import { useChatbot } from '@/stores/useChatbot'
import { useAuth } from '@/stores/useAuth'
import { useModo } from '@/stores/useModo'
import { intents, intentsParaModo, matchIntent, type Paso } from '@/features/chatbot/script'
import { servicios } from '@/mocks/servicios'
import { herramientas } from '@/mocks/herramientas'
import { usersById } from '@/mocks/users'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { PriceTag } from '@/components/ui/PriceTag'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { formatCLP } from '@/lib/format'
import { brand } from '@/config/brand'
import type { ChatbotBlock, MensajeChatbot } from '@/types'

const saludoParticular = `Hola 👋 Cuéntame qué necesitas resolver en casa. Te recomiendo el maestro indicado y armamos juntos una cotización referencial.`
const saludoProfesional = `Hola 👋 Cuéntame de tu obra: tipo, tamaño y plazo. Te armo el paquete completo — cuadrillas, equipos y cotización inicial.`

export function Asistente() {
  const user = useAuth((s) => s.user())
  const modo = useModo((s) => s.modo)
  const saludo = modo === 'profesional' ? saludoProfesional : saludoParticular
  const { conversaciones, actualId, nueva, push, setActual, get } = useChatbot()
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [flow, setFlow] = useState<{ intentId: string; pasoId: string } | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!actualId) {
      const c = nueva(user?.id, 'Nueva conversación')
      push(c.id, { rol: 'bot', texto: saludo })
    }
  }, [actualId, nueva, push, user?.id])

  const conv = actualId ? get(actualId) : undefined
  const mensajes = conv?.mensajes ?? []

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensajes.length, typing])

  function runPaso(intentId: string, pasoId: string) {
    const intent = intents.find((i) => i.id === intentId)!
    const paso = intent.pasos.find((p) => p.id === pasoId)!
    if (!conv) return
    setTyping(true)
    setTimeout(() => {
      push(conv.id, { rol: 'bot', texto: paso.bot, componentes: paso.bloque ? [paso.bloque] : [] })
      setTyping(false)
      if (typeof paso.siguiente === 'string') {
        setFlow({ intentId, pasoId: paso.siguiente })
      } else {
        setFlow(null)
      }
    }, 700)
  }

  function handleSend(t?: string) {
    const m = (t ?? text).trim()
    if (!m || !conv) return
    push(conv.id, { rol: 'user', texto: m })
    setText('')
    // advance scripted flow
    if (flow) {
      runPaso(flow.intentId, flow.pasoId)
      return
    }
    const intent = matchIntent(m)
    if (intent) {
      runPaso(intent.id, intent.pasos[0].id)
    } else {
      setTyping(true)
      setTimeout(() => {
        push(conv.id, {
          rol: 'bot',
          texto:
            'No estoy seguro de tener suficiente contexto. ¿Es una remodelación de baño, terraza, instalación eléctrica, mudanza o reparación urgente?',
          componentes: [
            {
              kind: 'chips',
              preguntaId: 'sugerencias',
              opciones: intentsParaModo(modo).map((i) => ({ id: i.id, label: i.titulo })),
            },
          ],
        })
        setTyping(false)
      }, 700)
    }
  }

  function onChip(opt: { id: string; label: string }) {
    if (!conv) return
    // If this chip matches an intent title, start that intent
    const intent = intents.find((i) => i.id === opt.id)
    if (intent) {
      push(conv.id, { rol: 'user', texto: opt.label })
      runPaso(intent.id, intent.pasos[0].id)
      return
    }
    handleSend(opt.label)
  }

  const history = useMemo(() => conversaciones.filter((c) => (user ? c.usuarioId === user.id : !c.usuarioId)), [conversaciones, user])

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
              onClick={() => {
                const c = nueva(user?.id, 'Nueva conversación')
                setActual(c.id)
                setFlow(null)
                push(c.id, { rol: 'bot', texto: saludo })
              }}
            >
              <Plus className="h-4 w-4" /> Nueva conversación
            </Button>
          </div>

          <div className="card p-5">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
              <BookOpen className="h-4 w-4" /> Sugerencias
            </h3>
            <ul className="mt-3 space-y-2">
              {intentsParaModo(modo).map((i) => (
                <li key={i.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-navy/10 px-3 py-2 text-sm hover:border-navy/30"
                    onClick={() => {
                      if (!conv) return
                      push(conv.id, { rol: 'user', texto: i.titulo })
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
                      onClick={() => setActual(c.id)}
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
              <p className="text-xs text-ink-400">Responde en modo mock · guionado</p>
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
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {block.trabajadorIds.map((id) => {
          const s = servicios.find((x) => x.trabajadorId === id) ?? servicios.find((x) => x.id === id)
          if (!s) return null
          const u = usersById[s.trabajadorId]
          return (
            <div key={id} className="card flex items-start gap-3 p-4">
              <Avatar src={u?.fotoPerfil} name={u?.nombre} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{u?.nombre}</p>
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
          )
        })}
      </div>
    )
  }
  if (block.kind === 'tools') {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {block.herramientaIds.map((id) => {
          const h = herramientas.find((x) => x.id === id)
          if (!h) return null
          return (
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
          )
        })}
      </div>
    )
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
