import { supabase } from '@/lib/supabase'
import type { Conversacion, MensajeChat } from '@/types'

interface ConversacionRow {
  id: string
  participante_a: string
  participante_b: string
  contratacion_id: string | null
  ultimo_mensaje: string | null
  ultimo_mensaje_fecha: string | null
  no_leidos_a: number | null
  no_leidos_b: number | null
  created_at: string
}

interface MensajeRow {
  id: string
  conversacion_id: string
  emisor_id: string
  texto: string
  adjuntos: { nombre: string; url: string }[] | null
  fecha: string
  leido: boolean | null
}

function rowToConv(r: ConversacionRow, currentUser: string): Conversacion {
  const noLeidos = currentUser === r.participante_a ? r.no_leidos_a : r.no_leidos_b
  return {
    id: r.id,
    participantes: [r.participante_a, r.participante_b],
    contratacionId: r.contratacion_id ?? undefined,
    ultimoMensaje: r.ultimo_mensaje ?? undefined,
    ultimoMensajeFecha: r.ultimo_mensaje_fecha ?? undefined,
    noLeidos: noLeidos ?? 0,
  }
}

function rowToMensaje(r: MensajeRow): MensajeChat {
  return {
    id: r.id,
    conversacionId: r.conversacion_id,
    emisorId: r.emisor_id,
    texto: r.texto,
    adjuntos: r.adjuntos ?? undefined,
    fecha: r.fecha,
    leido: r.leido ?? false,
  }
}

export async function listConversaciones(userId: string): Promise<Conversacion[]> {
  const { data, error } = await supabase
    .from('conversaciones')
    .select('*')
    .or(`participante_a.eq.${userId},participante_b.eq.${userId}`)
    .order('ultimo_mensaje_fecha', { ascending: false, nullsFirst: false })
  if (error) {
    console.error('[listConversaciones]', error)
    return []
  }
  return (data ?? []).map((r) => rowToConv(r as ConversacionRow, userId))
}

export async function getConversacion(id: string, userId: string): Promise<Conversacion | null> {
  const { data, error } = await supabase
    .from('conversaciones')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return rowToConv(data as ConversacionRow, userId)
}

export async function findOrCreateConversacion(
  userA: string,
  userB: string,
  contratacionId?: string,
): Promise<Conversacion> {
  // Orden canónico para no duplicar conversaciones (A,B) vs (B,A)
  const [a, b] = userA < userB ? [userA, userB] : [userB, userA]
  const { data: existing } = await supabase
    .from('conversaciones')
    .select('*')
    .eq('participante_a', a)
    .eq('participante_b', b)
    .maybeSingle()
  if (existing) {
    if (contratacionId && (existing as ConversacionRow).contratacion_id !== contratacionId) {
      await supabase.from('conversaciones').update({ contratacion_id: contratacionId }).eq('id', existing.id)
    }
    return rowToConv(existing as ConversacionRow, userA)
  }
  const { data, error } = await supabase
    .from('conversaciones')
    .insert({
      participante_a: a,
      participante_b: b,
      contratacion_id: contratacionId ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return rowToConv(data as ConversacionRow, userA)
}

export async function listMensajes(conversacionId: string): Promise<MensajeChat[]> {
  const { data, error } = await supabase
    .from('mensajes_chat')
    .select('*')
    .eq('conversacion_id', conversacionId)
    .order('fecha', { ascending: true })
  if (error) {
    console.error('[listMensajes]', error)
    return []
  }
  return (data ?? []).map((r) => rowToMensaje(r as MensajeRow))
}

export async function enviarMensaje(
  conversacionId: string,
  emisorId: string,
  texto: string,
): Promise<MensajeChat> {
  const { data, error } = await supabase
    .from('mensajes_chat')
    .insert({ conversacion_id: conversacionId, emisor_id: emisorId, texto })
    .select()
    .single()
  if (error) throw error
  // Actualiza el snapshot en la conversación
  await supabase
    .from('conversaciones')
    .update({
      ultimo_mensaje: texto.slice(0, 200),
      ultimo_mensaje_fecha: data.fecha,
    })
    .eq('id', conversacionId)
  return rowToMensaje(data as MensajeRow)
}

export async function marcarLeidos(conversacionId: string, userId: string) {
  const { data: conv } = await supabase
    .from('conversaciones')
    .select('participante_a, participante_b')
    .eq('id', conversacionId)
    .maybeSingle()
  if (!conv) return
  const isA = (conv as ConversacionRow).participante_a === userId
  await supabase
    .from('conversaciones')
    .update(isA ? { no_leidos_a: 0 } : { no_leidos_b: 0 })
    .eq('id', conversacionId)
  // Marca como leídos los mensajes del otro
  await supabase
    .from('mensajes_chat')
    .update({ leido: true })
    .eq('conversacion_id', conversacionId)
    .neq('emisor_id', userId)
}

/** Realtime: suscribe a nuevos mensajes de una conversación. */
export function subscribeToMensajes(
  conversacionId: string,
  onMensaje: (m: MensajeChat) => void,
) {
  const channel = supabase
    .channel(`chat:${conversacionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes_chat',
        filter: `conversacion_id=eq.${conversacionId}`,
      },
      (payload) => {
        onMensaje(rowToMensaje(payload.new as MensajeRow))
      },
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

/** Realtime: suscribe a cambios en cualquier conversación del usuario. */
export function subscribeToConversaciones(userId: string, onChange: () => void) {
  const channel = supabase
    .channel(`conv:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'conversaciones' },
      (payload) => {
        const r = payload.new as ConversacionRow | undefined
        if (!r) return onChange()
        if (r.participante_a === userId || r.participante_b === userId) onChange()
      },
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}
