import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Conversacion, MensajeChat } from '@/types'
import { conversacionesSeed, mensajesSeed } from '@/mocks/chat'
import { uid } from '@/lib/mockApi'

interface State {
  conversaciones: Conversacion[]
  mensajes: MensajeChat[]
  enviar: (conversacionId: string, emisorId: string, texto: string) => void
  simularRespuesta: (conversacionId: string, emisorId: string) => void
  marcarLeidos: (conversacionId: string) => void
  startOrGet: (userA: string, userB: string) => Conversacion
}

export const useChat = create<State>()(
  persist(
    (set, get) => ({
      conversaciones: conversacionesSeed,
      mensajes: mensajesSeed,
      enviar: (conversacionId, emisorId, texto) => {
        const m: MensajeChat = {
          id: uid('m'),
          conversacionId,
          emisorId,
          texto,
          fecha: new Date().toISOString(),
          leido: false,
        }
        set((s) => ({
          mensajes: [...s.mensajes, m],
          conversaciones: s.conversaciones.map((c) =>
            c.id === conversacionId
              ? { ...c, ultimoMensaje: texto, ultimoMensajeFecha: m.fecha }
              : c,
          ),
        }))
      },
      simularRespuesta: (conversacionId, yoId) => {
        const conv = get().conversaciones.find((c) => c.id === conversacionId)
        if (!conv) return
        const otro = conv.participantes.find((p) => p !== yoId)
        if (!otro) return
        const replies = [
          'Perfecto, coordinemos por acá 👌',
          'Confirmo que llegué, pronto te aviso cómo va.',
          'Te envío la cotización en unos minutos.',
          '¡Gracias! Nos vemos pronto.',
          'Recibido, lo reviso y te aviso.',
        ]
        setTimeout(() => {
          const m: MensajeChat = {
            id: uid('m'),
            conversacionId,
            emisorId: otro,
            texto: replies[Math.floor(Math.random() * replies.length)],
            fecha: new Date().toISOString(),
            leido: false,
          }
          set((s) => ({
            mensajes: [...s.mensajes, m],
            conversaciones: s.conversaciones.map((c) =>
              c.id === conversacionId
                ? {
                    ...c,
                    ultimoMensaje: m.texto,
                    ultimoMensajeFecha: m.fecha,
                    noLeidos: (c.noLeidos ?? 0) + 1,
                  }
                : c,
            ),
          }))
        }, 2000 + Math.random() * 2000)
      },
      marcarLeidos: (conversacionId) => {
        set((s) => ({
          conversaciones: s.conversaciones.map((c) =>
            c.id === conversacionId ? { ...c, noLeidos: 0 } : c,
          ),
          mensajes: s.mensajes.map((m) =>
            m.conversacionId === conversacionId ? { ...m, leido: true } : m,
          ),
        }))
      },
      startOrGet: (a, b) => {
        const existing = get().conversaciones.find(
          (c) => c.participantes.includes(a) && c.participantes.includes(b),
        )
        if (existing) return existing
        const nueva: Conversacion = {
          id: uid('conv'),
          participantes: [a, b],
          noLeidos: 0,
        }
        set((s) => ({ conversaciones: [nueva, ...s.conversaciones] }))
        return nueva
      },
    }),
    { name: 'cuadrilla:chat' },
  ),
)
