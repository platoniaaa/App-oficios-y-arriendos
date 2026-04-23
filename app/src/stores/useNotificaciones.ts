import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notificacion } from '@/types'
import { notificacionesSeed } from '@/mocks/notificaciones'
import { uid } from '@/lib/mockApi'

interface State {
  items: Notificacion[]
  push: (n: Omit<Notificacion, 'id' | 'fecha' | 'leida'>) => void
  marcarLeida: (id: string) => void
  marcarTodasLeidas: (usuarioId: string) => void
  noLeidas: (usuarioId: string) => number
}

export const useNotificaciones = create<State>()(
  persist(
    (set, get) => ({
      items: notificacionesSeed,
      push: (n) => {
        const nueva: Notificacion = {
          ...n,
          id: uid('n'),
          fecha: new Date().toISOString(),
          leida: false,
        }
        set((s) => ({ items: [nueva, ...s.items] }))
      },
      marcarLeida: (id) => set((s) => ({ items: s.items.map((n) => (n.id === id ? { ...n, leida: true } : n)) })),
      marcarTodasLeidas: (userId) =>
        set((s) => ({ items: s.items.map((n) => (n.usuarioId === userId ? { ...n, leida: true } : n)) })),
      noLeidas: (userId) => get().items.filter((n) => n.usuarioId === userId && !n.leida).length,
    }),
    { name: 'cuadrilla:notificaciones' },
  ),
)
