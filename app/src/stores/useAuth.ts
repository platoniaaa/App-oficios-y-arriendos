import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { users, usersById } from '@/mocks/users'

type Credenciales = { email: string; password: string }

interface AuthState {
  userId: string | null
  hydrated: boolean
  user: () => User | null
  login: (creds: Credenciales) => Promise<User | null>
  loginDemo: (role: 'cliente' | 'trabajador' | 'arrendador') => User | null
  logout: () => void
  setUser: (u: User) => void
  upsertVerificaciones: (partial: Partial<User['verificacion']>) => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      userId: null,
      hydrated: false,
      user: () => {
        const id = get().userId
        return id ? usersById[id] ?? null : null
      },
      login: async ({ email }) => {
        const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase())
        await new Promise((r) => setTimeout(r, 300))
        if (u) set({ userId: u.id })
        return u ?? null
      },
      loginDemo: (role) => {
        const map: Record<string, string> = {
          cliente: 'u-demo-cliente',
          trabajador: 'u-demo-trabajador',
          arrendador: 'u-demo-arrendador',
        }
        const id = map[role]
        set({ userId: id })
        return usersById[id] ?? null
      },
      logout: () => set({ userId: null }),
      setUser: (u) => {
        usersById[u.id] = u
        set({ userId: u.id })
      },
      upsertVerificaciones: (partial) => {
        const id = get().userId
        if (!id) return
        const u = usersById[id]
        if (!u) return
        usersById[id] = { ...u, verificacion: { ...u.verificacion, ...partial } }
        set({ userId: id })
      },
    }),
    {
      name: 'cuadrilla:auth',
      partialize: (s) => ({ userId: s.userId }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true
      },
    },
  ),
)
