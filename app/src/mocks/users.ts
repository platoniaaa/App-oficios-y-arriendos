import type { User } from '@/types'

// La plataforma usa Supabase Auth + tabla profiles para los usuarios reales.
// Estos arrays quedan vacíos: las pantallas que aún consultan localmente
// muestran empty states. Las queries reales se hacen en lib/profile.ts.
export const users: User[] = []

export const usersById: Record<string, User> = {}
