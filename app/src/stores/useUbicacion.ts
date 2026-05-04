import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface State {
  comuna: string | null
  setComuna: (c: string | null) => void
}

export const useUbicacion = create<State>()(
  persist(
    (set) => ({
      comuna: null,
      setComuna: (c) => set({ comuna: c }),
    }),
    { name: 'cuadrilla:ubicacion' },
  ),
)
