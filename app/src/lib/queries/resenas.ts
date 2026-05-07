import { supabase } from '@/lib/supabase'
import type { Resena } from '@/types'

interface ResenaRow {
  id: string
  contratacion_id: string
  autor_id: string
  destino_id: string
  estrellas: number
  sub_puntualidad: number | null
  sub_calidad: number | null
  sub_comunicacion: number | null
  sub_precio: number | null
  sub_estado_entrega: number | null
  comentario: string | null
  recomienda: boolean | null
  utiles: number | null
  respuesta: string | null
  respuesta_fecha: string | null
  created_at: string
}

function rowToResena(r: ResenaRow): Resena {
  return {
    id: r.id,
    contratacionId: r.contratacion_id,
    autorId: r.autor_id,
    destinoId: r.destino_id,
    estrellas: r.estrellas,
    subcategorias: {
      puntualidad: r.sub_puntualidad ?? undefined,
      calidad: r.sub_calidad ?? undefined,
      comunicacion: r.sub_comunicacion ?? undefined,
      precio: r.sub_precio ?? undefined,
      estadoEntrega: r.sub_estado_entrega ?? undefined,
    },
    comentario: r.comentario ?? '',
    recomienda: r.recomienda ?? true,
    fecha: r.created_at,
    respuesta: r.respuesta
      ? { texto: r.respuesta, fecha: r.respuesta_fecha ?? '' }
      : undefined,
    utiles: r.utiles ?? 0,
  }
}

export async function listResenasParaUsuario(destinoId: string): Promise<Resena[]> {
  const { data, error } = await supabase
    .from('resenas')
    .select('*')
    .eq('destino_id', destinoId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[listResenasParaUsuario]', error)
    return []
  }
  return (data ?? []).map((r) => rowToResena(r as ResenaRow))
}

export async function listResenasDePorAutor(autorId: string): Promise<Resena[]> {
  const { data, error } = await supabase
    .from('resenas')
    .select('*')
    .eq('autor_id', autorId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[listResenasDePorAutor]', error)
    return []
  }
  return (data ?? []).map((r) => rowToResena(r as ResenaRow))
}

export interface CrearResenaInput {
  contratacion_id: string
  autor_id: string
  destino_id: string
  estrellas: number
  sub_puntualidad?: number | null
  sub_calidad?: number | null
  sub_comunicacion?: number | null
  sub_precio?: number | null
  sub_estado_entrega?: number | null
  comentario: string
  recomienda?: boolean
}

export async function crearResena(input: CrearResenaInput): Promise<Resena> {
  const { data, error } = await supabase.from('resenas').insert(input).select().single()
  if (error) throw error
  return rowToResena(data as ResenaRow)
}

export async function responderResena(id: string, texto: string) {
  const { error } = await supabase
    .from('resenas')
    .update({ respuesta: texto, respuesta_fecha: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
