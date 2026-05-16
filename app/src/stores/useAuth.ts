import { create } from 'zustand'
import type { User } from '@/types'
import { supabase } from '@/lib/supabase'
import { fetchProfile, updateProfile, type ProfileRow } from '@/lib/profile'

type Credenciales = { email: string; password: string }

interface RegistroPayload {
  email: string
  password: string
  perfil: Partial<ProfileRow> & { nombre: string }
}

interface AuthState {
  userId: string | null
  currentUser: User | null
  loading: boolean
  hydrated: boolean
  /** Inicializa la sesión y suscribe a cambios. Llamar una vez al boot. */
  init: () => Promise<() => void>
  /** Compatibilidad: el código viejo usa `useAuth(s => s.user())`. */
  user: () => User | null
  login: (creds: Credenciales) => Promise<{ user: User | null; error: string | null }>
  register: (payload: RegistroPayload) => Promise<{ user: User | null; error: string | null }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  setUser: (u: User) => void
  upsertVerificaciones: (partial: Partial<User['verificacion']>) => Promise<void>
}

export const useAuth = create<AuthState>()((set, get) => ({
  userId: null,
  currentUser: null,
  loading: false,
  hydrated: false,

  user: () => get().currentUser,

  init: async () => {
    const { data } = await supabase.auth.getSession()
    const session = data.session
    if (session?.user) {
      const u = await fetchProfile(session.user.id)
      set({ userId: session.user.id, currentUser: u, hydrated: true })
    } else {
      set({ userId: null, currentUser: null, hydrated: true })
    }

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (sess?.user) {
        const u = await fetchProfile(sess.user.id)
        set({ userId: sess.user.id, currentUser: u })
      } else {
        set({ userId: null, currentUser: null })
      }
    })
    return () => sub.subscription.unsubscribe()
  },

  login: async ({ email, password }) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) {
        set({ loading: false })
        return { user: null, error: traduceError(error?.message) }
      }
      let u: User | null = null
      try {
        u = await fetchProfile(data.user.id)
      } catch (e) {
        console.error('[login] fetchProfile falló', e)
      }
      set({ userId: data.user.id, currentUser: u, loading: false })
      if (!u) {
        return { user: null, error: 'No pudimos cargar tu perfil. Reintenta en unos segundos.' }
      }
      return { user: u, error: null }
    } catch (e) {
      console.error('[login] excepción inesperada', e)
      set({ loading: false })
      return {
        user: null,
        error: e instanceof Error ? e.message : 'No se pudo iniciar sesión.',
      }
    }
  },

  register: async ({ email, password, perfil }) => {
    set({ loading: true })
    const timeout = <T,>(p: Promise<T>, ms: number, label: string): Promise<T> =>
      Promise.race([
        p,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(`${label} excedió ${ms / 1000}s`)), ms),
        ),
      ])
    try {
      const { data, error } = await timeout(
        supabase.auth.signUp({
          email,
          password,
          options: { data: { nombre: perfil.nombre } },
        }),
        20_000,
        'signUp',
      )
      if (error) {
        set({ loading: false })
        return { user: null, error: traduceError(error.message) }
      }
      if (!data.user) {
        set({ loading: false })
        return { user: null, error: 'Error inesperado al registrar.' }
      }

      // El trigger en BD ya creó el row en profiles con email+nombre. Actualizamos el resto.
      if (Object.keys(perfil).length > 1) {
        try {
          await timeout(
            updateProfile(data.user.id, { ...perfil, email }),
            15_000,
            'updateProfile',
          )
        } catch (e) {
          console.warn('[register] profile patch error', e)
        }
      }

      // Si Supabase pide confirmar email, no hay session aún.
      if (!data.session) {
        set({ loading: false })
        return { user: null, error: 'CONFIRMAR_EMAIL' }
      }

      let u: User | null = null
      try {
        u = await timeout(fetchProfile(data.user.id), 10_000, 'fetchProfile')
      } catch (e) {
        console.error('[register] fetchProfile falló', e)
      }
      set({ userId: data.user.id, currentUser: u, loading: false })
      return { user: u, error: null }
    } catch (e) {
      console.error('[register] excepción inesperada', e)
      set({ loading: false })
      return {
        user: null,
        error: e instanceof Error ? e.message : 'No se pudo crear la cuenta.',
      }
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ userId: null, currentUser: null })
  },

  refresh: async () => {
    const id = get().userId
    if (!id) return
    const u = await fetchProfile(id)
    set({ currentUser: u })
  },

  setUser: (u) => set({ currentUser: u, userId: u.id }),

  upsertVerificaciones: async (partial) => {
    const id = get().userId
    if (!id) return
    const patch: Partial<ProfileRow> = {}
    if (partial.rut) patch.verif_rut = partial.rut
    if (partial.cedula) patch.verif_cedula = partial.cedula
    if (partial.antecedentes) patch.verif_antecedentes = partial.antecedentes
    if (partial.certificaciones) patch.verif_certificaciones = partial.certificaciones
    await updateProfile(id, patch)
    await get().refresh()
  },
}))

// Traducción de mensajes de Supabase a español
function traduceError(msg?: string): string {
  if (!msg) return 'Error desconocido.'
  if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.'
  if (msg.includes('Email not confirmed')) return 'Aún no confirmas tu email. Revisa tu bandeja.'
  if (msg.includes('User already registered')) return 'Ya hay una cuenta con ese email.'
  if (msg.includes('Password should be at least'))
    return 'La contraseña debe tener al menos 6 caracteres.'
  if (msg.includes('rate limit')) return 'Demasiados intentos, espera un minuto.'
  return msg
}
