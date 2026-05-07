import { supabase } from '@/lib/supabase'
import type { ServicioOficio, TipoTarifaServicio } from '@/types'

export interface ServicioRow {
  id: string
  trabajador_id: string
  oficio: string
  categorias: string[] | null
  descripcion: string | null
  experiencia_anios: number | null
  tarifa_tipo: TipoTarifaServicio | null
  tarifa_monto: number | null
  zonas_cobertura: string[] | null
  disponibilidad: 'inmediata' | 'agendada' | 'ocupado' | null
  galeria_trabajos: string[] | null
  total_trabajos_realizados: number | null
  calificacion: number | null
  faq: { q: string; a: string }[] | null
  vistas: number | null
  estado: 'activo' | 'pausado' | 'eliminado' | null
  created_at: string | null
  updated_at: string | null
}

export function rowToServicio(r: ServicioRow): ServicioOficio {
  return {
    id: r.id,
    trabajadorId: r.trabajador_id,
    oficio: r.oficio,
    categorias: r.categorias ?? [],
    descripcion: r.descripcion ?? '',
    experienciaAnios: r.experiencia_anios ?? 0,
    tarifaReferencia: {
      tipo: (r.tarifa_tipo ?? 'a_convenir') as TipoTarifaServicio,
      monto: r.tarifa_monto ?? undefined,
    },
    zonasCobertura: r.zonas_cobertura ?? [],
    disponibilidad: r.disponibilidad ?? 'agendada',
    certificaciones: [],
    galeriaTrabajos: r.galeria_trabajos ?? [],
    totalTrabajosRealizados: r.total_trabajos_realizados ?? 0,
    calificacion: Number(r.calificacion ?? 0),
    faq: r.faq ?? undefined,
  }
}

export async function listServicios(): Promise<ServicioOficio[]> {
  const { data, error } = await supabase
    .from('servicios_oficios')
    .select('*')
    .eq('estado', 'activo')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[listServicios]', error)
    return []
  }
  return (data ?? []).map(rowToServicio)
}

export async function getServicio(id: string): Promise<ServicioOficio | null> {
  const { data, error } = await supabase
    .from('servicios_oficios')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) {
    if (error) console.error('[getServicio]', error)
    return null
  }
  return rowToServicio(data as ServicioRow)
}

export async function listServiciosDeUsuario(trabajadorId: string): Promise<ServicioOficio[]> {
  const { data, error } = await supabase
    .from('servicios_oficios')
    .select('*')
    .eq('trabajador_id', trabajadorId)
    .neq('estado', 'eliminado')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[listServiciosDeUsuario]', error)
    return []
  }
  return (data ?? []).map(rowToServicio)
}

export type CrearServicioInput = Omit<
  ServicioRow,
  'id' | 'created_at' | 'updated_at' | 'vistas' | 'total_trabajos_realizados' | 'calificacion'
>

export async function crearServicio(input: CrearServicioInput) {
  const { data, error } = await supabase
    .from('servicios_oficios')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as ServicioRow
}

export async function actualizarServicio(id: string, patch: Partial<ServicioRow>) {
  const { error } = await supabase.from('servicios_oficios').update(patch).eq('id', id)
  if (error) throw error
}
