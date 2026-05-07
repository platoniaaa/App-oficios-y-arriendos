import { supabase } from '@/lib/supabase'
import type { Contratacion, EstadoContratacion } from '@/types'
import { fees } from '@/config/brand'

interface ContratacionRow {
  id: string
  tipo: 'servicio' | 'arriendo'
  cliente_id: string
  ofertante_id: string
  servicio_id: string | null
  herramienta_id: string | null
  fecha_solicitud: string
  fecha_inicio: string | null
  fecha_fin: string | null
  monto: number
  comision: number
  deposito: number | null
  total: number
  estado: EstadoContratacion
  descripcion_trabajo: string | null
  notas: string | null
  adjuntos: { nombre: string; url: string }[] | null
  created_at: string
  updated_at: string
}

interface HistorialRow {
  estado: EstadoContratacion
  fecha: string
}

function rowToContratacion(
  r: ContratacionRow,
  historial: HistorialRow[] = [],
): Contratacion {
  return {
    id: r.id,
    tipo: r.tipo,
    clienteId: r.cliente_id,
    ofertanteId: r.ofertante_id,
    itemId: (r.servicio_id ?? r.herramienta_id ?? '') as string,
    fechaSolicitud: r.fecha_solicitud,
    fechaInicio: r.fecha_inicio ?? '',
    fechaFin: r.fecha_fin ?? undefined,
    monto: r.monto,
    comision: r.comision,
    deposito: r.deposito ?? undefined,
    total: r.total,
    estado: r.estado,
    historialEstados: historial,
    notas: r.notas ?? undefined,
    adjuntos: r.adjuntos ?? undefined,
    descripcionTrabajo: r.descripcion_trabajo ?? undefined,
  }
}

export async function listContratacionesDeUsuario(userId: string): Promise<Contratacion[]> {
  const { data, error } = await supabase
    .from('contrataciones')
    .select('*')
    .or(`cliente_id.eq.${userId},ofertante_id.eq.${userId}`)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[listContratacionesDeUsuario]', error)
    return []
  }
  return (data ?? []).map((r) => rowToContratacion(r as ContratacionRow))
}

export async function getContratacion(id: string): Promise<Contratacion | null> {
  const [{ data: c, error: ce }, { data: h }] = await Promise.all([
    supabase.from('contrataciones').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('contratacion_historial')
      .select('estado, fecha')
      .eq('contratacion_id', id)
      .order('fecha', { ascending: true }),
  ])
  if (ce || !c) {
    if (ce) console.error('[getContratacion]', ce)
    return null
  }
  return rowToContratacion(c as ContratacionRow, (h ?? []) as HistorialRow[])
}

export interface CrearContratacionInput {
  tipo: 'servicio' | 'arriendo'
  cliente_id: string
  ofertante_id: string
  servicio_id?: string | null
  herramienta_id?: string | null
  fecha_inicio?: string
  fecha_fin?: string
  monto: number
  deposito?: number
  estado: EstadoContratacion
  descripcion_trabajo?: string
}

export async function crearContratacion(input: CrearContratacionInput): Promise<Contratacion> {
  const comision = Math.round(input.monto * fees.comisionPlataforma)
  const total = input.monto + comision + (input.deposito ?? 0)
  const { data, error } = await supabase
    .from('contrataciones')
    .insert({
      tipo: input.tipo,
      cliente_id: input.cliente_id,
      ofertante_id: input.ofertante_id,
      servicio_id: input.servicio_id ?? null,
      herramienta_id: input.herramienta_id ?? null,
      fecha_inicio: input.fecha_inicio ?? null,
      fecha_fin: input.fecha_fin ?? null,
      monto: input.monto,
      deposito: input.deposito ?? 0,
      comision,
      total,
      estado: input.estado,
      descripcion_trabajo: input.descripcion_trabajo ?? null,
    })
    .select()
    .single()
  if (error) throw error

  await supabase.from('contratacion_historial').insert({
    contratacion_id: data.id,
    estado: input.estado,
  })

  return rowToContratacion(data as ContratacionRow, [
    { estado: input.estado, fecha: new Date().toISOString() },
  ])
}

export async function actualizarEstadoContratacion(id: string, nuevo: EstadoContratacion) {
  const { error } = await supabase
    .from('contrataciones')
    .update({ estado: nuevo })
    .eq('id', id)
  if (error) throw error
  await supabase.from('contratacion_historial').insert({ contratacion_id: id, estado: nuevo })
}
