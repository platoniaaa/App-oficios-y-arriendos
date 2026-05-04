import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Modo = 'particular' | 'profesional'

interface State {
  modo: Modo | null
  setModo: (m: Modo) => void
  reset: () => void
}

export const useModo = create<State>()(
  persist(
    (set) => ({
      modo: null,
      setModo: (m) => set({ modo: m }),
      reset: () => set({ modo: null }),
    }),
    { name: 'cuadrilla:modo' },
  ),
)
