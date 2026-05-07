import { supabase } from '@/lib/supabase'
import type {
  Herramienta,
  EstadoHerramienta,
  RetiroModalidad,
  EstadoOperacionalHerramienta,
  DateRange,
} from '@/types'

export interface HerramientaRow {
  id: string
  propietario_id: string
  titulo: string
  categoria: string
  subcategoria: string | null
  marca: string | null
  modelo: string | null
  descripcion: string | null
  fotos: string[] | null
  estado_fisico: EstadoHerramienta | null
  tarifa_hora: number | null
  tarifa_dia: number | null
  tarifa_semana: number | null
  deposito_garantia: number | null
  requiere_entrega: boolean | null
  comuna_ubicacion: string | null
  retiro: RetiroModalidad | null
  disponibilidad: DateRange[] | null
  total_arriendos: number | null
  calificacion: number | null
  estado_operacional: EstadoOperacionalHerramienta | null
  vistas: number | null
  estado: 'activo' | 'pausado' | 'eliminado' | null
  created_at: string | null
  updated_at: string | null
}

export function rowToHerramienta(r: HerramientaRow): Herramienta {
  return {
    id: r.id,
    propietarioId: r.propietario_id,
    titulo: r.titulo,
    categoria: r.categoria,
    subcategoria: r.subcategoria ?? '',
    marca: r.marca ?? '',
    modelo: r.modelo ?? '',
    descripcion: r.descripcion ?? '',
    fotos: r.fotos ?? [],
    estado: r.estado_fisico ?? 'buena',
    tarifa: {
      porHora: r.tarifa_hora ?? undefined,
      porDia: r.tarifa_dia ?? undefined,
      porSemana: r.tarifa_semana ?? undefined,
    },
    depositoGarantia: r.deposito_garantia ?? 0,
    requiereEntrega: r.requiere_entrega ?? false,
    comunaUbicacion: r.comuna_ubicacion ?? '',
    retiro: r.retiro ?? 'ambos',
    disponibilidad: r.disponibilidad ?? [],
    totalArriendos: r.total_arriendos ?? 0,
    calificacion: Number(r.calificacion ?? 0),
    estadoOperacional: r.estado_operacional ?? 'disponible',
    vistas: r.vistas ?? 0,
  }
}

export async function listHerramientas(): Promise<Herramienta[]> {
  const { data, error } = await supabase
    .from('herramientas')
    .select('*')
    .eq('estado', 'activo')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[listHerramientas]', error)
    return []
  }
  return (data ?? []).map(rowToHerramienta)
}

export async function getHerramienta(id: string): Promise<Herramienta | null> {
  const { data, error } = await supabase
    .from('herramientas')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) {
    if (error) console.error('[getHerramienta]', error)
    return null
  }
  return rowToHerramienta(data as HerramientaRow)
}

export async function listHerramientasDeUsuario(propietarioId: string): Promise<Herramienta[]> {
  const { data, error } = await supabase
    .from('herramientas')
    .select('*')
    .eq('propietario_id', propietarioId)
    .neq('estado', 'eliminado')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[listHerramientasDeUsuario]', error)
    return []
  }
  return (data ?? []).map(rowToHerramienta)
}

export type CrearHerramientaInput = Omit<
  HerramientaRow,
  'id' | 'created_at' | 'updated_at' | 'vistas' | 'total_arriendos' | 'calificacion'
>

export async function crearHerramienta(input: CrearHerramientaInput) {
  const { data, error } = await supabase
    .from('herramientas')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as HerramientaRow
}

export async function actualizarHerramienta(id: string, patch: Partial<HerramientaRow>) {
  const { error } = await supabase.from('herramientas').update(patch).eq('id', id)
  if (error) throw error
}
