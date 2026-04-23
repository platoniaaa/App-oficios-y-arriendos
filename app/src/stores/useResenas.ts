import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Resena } from '@/types'
import { resenas } from '@/mocks/resenas'
import { uid } from '@/lib/mockApi'

interface State {
  items: Resena[]
  add: (r: Omit<Resena, 'id' | 'fecha'>) => Resena
  paraUsuario: (userId: string) => Resena[]
  dePorAutor: (autorId: string) => Resena[]
}

export const useResenas = create<State>()(
  persist(
    (set, get) => ({
      items: resenas,
      add: (r) => {
        const nueva: Resena = { ...r, id: uid('r'), fecha: new Date().toISOString() }
        set((s) => ({ items: [nueva, ...s.items] }))
        return nueva
      },
      paraUsuario: (userId) => get().items.filter((r) => r.destinoId === userId),
      dePorAutor: (autorId) => get().items.filter((r) => r.autorId === autorId),
    }),
    { name: 'cuadrilla:resenas' },
  ),
)
