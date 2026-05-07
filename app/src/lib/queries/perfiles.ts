import { supabase } from '@/lib/supabase'
import type { User } from '@/types'
import { profileToUser, type ProfileRow } from '@/lib/profile'

/** Trae varios perfiles a la vez por ID. Útil para mostrar avatares en grids. */
export async function getProfilesByIds(ids: string[]): Promise<Record<string, User>> {
  if (ids.length === 0) return {}
  const unique = Array.from(new Set(ids))
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', unique)
  if (error) {
    console.error('[getProfilesByIds]', error)
    return {}
  }
  const map: Record<string, User> = {}
  for (const r of (data ?? []) as ProfileRow[]) map[r.id] = profileToUser(r)
  return map
}

/** Perfil público por ID (cualquiera puede consultarlo gracias a RLS). */
export async function getProfile(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return profileToUser(data as ProfileRow)
}
