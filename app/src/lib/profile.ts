import { supabase } from './supabase'
import type { User } from '@/types'

// Fila tal cual viene de la tabla public.profiles
export interface ProfileRow {
  id: string
  tipo: 'persona' | 'empresa'
  nombre: string
  apellido: string | null
  razon_social: string | null
  giro: string | null
  rut: string | null
  telefono: string | null
  email: string | null
  foto_perfil: string | null
  region: string | null
  comuna: string | null
  direccion: string | null
  bio: string | null
  roles: string[] | null
  verif_rut: 'pendiente' | 'validada' | 'rechazada' | 'no_aplica'
  verif_cedula: 'pendiente' | 'validada' | 'rechazada' | 'no_aplica'
  verif_antecedentes: 'pendiente' | 'validada' | 'rechazada' | 'no_aplica'
  verif_certificaciones: 'pendiente' | 'validada' | 'rechazada' | 'no_aplica'
  calificacion_promedio: number | null
  total_resenas: number | null
  idiomas: string[] | null
  respuesta_promedio_hrs: number | null
  tasa_respuesta: number | null
  tasa_cumplimiento: number | null
  tasa_puntualidad: number | null
  tasa_recomendacion: number | null
  total_trabajos_completados: number | null
  total_arriendos_completados: number | null
  representante_legal: string | null
  faq: { q: string; a: string }[] | null
  nuevo_en_plataforma: boolean | null
  fecha_registro: string | null
}

// snake_case (BD) -> camelCase (frontend)
export function profileToUser(p: ProfileRow): User {
  return {
    id: p.id,
    tipo: p.tipo,
    nombre: p.nombre,
    apellido: p.apellido ?? undefined,
    razonSocial: p.razon_social ?? undefined,
    giro: p.giro ?? undefined,
    rut: p.rut ?? '',
    email: p.email ?? '',
    telefono: p.telefono ?? '',
    fotoPerfil:
      p.foto_perfil ??
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.nombre)}`,
    region: p.region ?? '',
    comuna: p.comuna ?? '',
    direccion: p.direccion ?? undefined,
    bio: p.bio ?? undefined,
    roles: (p.roles ?? ['cliente']) as User['roles'],
    verificacion: {
      rut: p.verif_rut,
      cedula: p.verif_cedula,
      antecedentes: p.verif_antecedentes,
      certificaciones: p.verif_certificaciones,
    },
    calificacionPromedio: Number(p.calificacion_promedio ?? 0),
    totalResenas: p.total_resenas ?? 0,
    fechaRegistro: p.fecha_registro ?? new Date().toISOString(),
    idiomas: p.idiomas ?? undefined,
    respuestaPromedioHrs: p.respuesta_promedio_hrs ?? undefined,
    tasaRespuesta: p.tasa_respuesta ?? undefined,
    tasaCumplimiento: p.tasa_cumplimiento ?? undefined,
    tasaPuntualidad: p.tasa_puntualidad ?? undefined,
    tasaRecomendacion: p.tasa_recomendacion ?? undefined,
    totalTrabajosCompletados: p.total_trabajos_completados ?? undefined,
    totalArriendosCompletados: p.total_arriendos_completados ?? undefined,
    nuevoEnPlataforma: p.nuevo_en_plataforma ?? undefined,
    faq: p.faq ?? undefined,
    representanteLegal: p.representante_legal ?? undefined,
  }
}

// Fetch del profile actual desde Supabase
export async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.error('[fetchProfile]', error)
    return null
  }
  return data ? profileToUser(data as ProfileRow) : null
}

// Update parcial del profile actual
export async function updateProfile(userId: string, patch: Partial<ProfileRow>) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId)
  if (error) throw error
}
