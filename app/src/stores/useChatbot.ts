import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ConversacionBot, MensajeChatbot } from '@/types'
import { uid } from '@/lib/mockApi'

interface State {
  conversaciones: ConversacionBot[]
  actualId: string | null
  nueva: (usuarioId?: string, titulo?: string) => ConversacionBot
  push: (convId: string, m: Omit<MensajeChatbot, 'id' | 'fecha'>) => MensajeChatbot
  setActual: (id: string | null) => void
  get: (id: string) => ConversacionBot | undefined
}

export const useChatbot = create<State>()(
  persist(
    (set, get) => ({
      conversaciones: [],
      actualId: null,
      nueva: (usuarioId, titulo) => {
        const nueva: ConversacionBot = {
          id: uid('bot'),
          usuarioId,
          titulo: titulo ?? 'Nueva conversación',
          creada: new Date().toISOString(),
          mensajes: [],
        }
        set((s) => ({ conversaciones: [nueva, ...s.conversaciones], actualId: nueva.id }))
        return nueva
      },
      push: (convId, m) => {
        const msg: MensajeChatbot = { ...m, id: uid('mb'), fecha: new Date().toISOString() }
        set((s) => ({
          conversaciones: s.conversaciones.map((c) =>
            c.id === convId ? { ...c, mensajes: [...c.mensajes, msg] } : c,
          ),
        }))
        return msg
      },
      setActual: (id) => set({ actualId: id }),
      get: (id) => get().conversaciones.find((c) => c.id === id),
    }),
    { name: 'cuadrilla:chatbot' },
  ),
)
