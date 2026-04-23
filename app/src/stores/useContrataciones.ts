import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Contratacion, EstadoContratacion } from '@/types'
import { contratacionesSeed } from '@/mocks/contrataciones'
import { uid } from '@/lib/mockApi'
import { fees } from '@/config/brand'

interface State {
  items: Contratacion[]
  add: (c: Omit<Contratacion, 'id' | 'comision' | 'total' | 'historialEstados'>) => Contratacion
  updateEstado: (id: string, estado: EstadoContratacion) => void
  get: (id: string) => Contratacion | undefined
}

export const useContrataciones = create<State>()(
  persist(
    (set, getState) => ({
      items: contratacionesSeed,
      add: (c) => {
        const comision = Math.round(c.monto * fees.comisionPlataforma)
        const deposito = c.deposito ?? 0
        const total = c.monto + comision + deposito
        const nueva: Contratacion = {
          ...c,
          id: uid('co'),
          comision,
          total,
          historialEstados: [{ estado: c.estado, fecha: new Date().toISOString() }],
        }
        set((s) => ({ items: [nueva, ...s.items] }))
        return nueva
      },
      updateEstado: (id, estado) => {
        set((s) => ({
          items: s.items.map((c) =>
            c.id === id
              ? {
                  ...c,
                  estado,
                  historialEstados: [
                    ...c.historialEstados,
                    { estado, fecha: new Date().toISOString() },
                  ],
                }
              : c,
          ),
        }))
      },
      get: (id) => getState().items.find((c) => c.id === id),
    }),
    { name: 'cuadrilla:contrataciones' },
  ),
)
