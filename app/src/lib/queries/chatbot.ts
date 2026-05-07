import { supabase } from '@/lib/supabase'
import type { ConversacionBot, MensajeChatbot, ChatbotBlock } from '@/types'

interface ConvRow {
  id: string
  usuario_id: string | null
  titulo: string | null
  created_at: string
}

interface MsgRow {
  id: string
  conversacion_id: string
  rol: 'user' | 'bot'
  texto: string
  componentes: ChatbotBlock[] | null
  fecha: string
}

function rowToConv(r: ConvRow, mensajes: MensajeChatbot[] = []): ConversacionBot {
  return {
    id: r.id,
    usuarioId: r.usuario_id ?? undefined,
    titulo: r.titulo ?? 'Nueva conversación',
    creada: r.created_at,
    mensajes,
  }
}

function rowToMsg(r: MsgRow): MensajeChatbot {
  return {
    id: r.id,
    rol: r.rol,
    texto: r.texto,
    fecha: r.fecha,
    componentes: r.componentes ?? undefined,
  }
}

export async function listConversacionesBot(usuarioId: string): Promise<ConversacionBot[]> {
  const { data, error } = await supabase
    .from('chatbot_conversaciones')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as ConvRow[]).map((r) => rowToConv(r))
}

export async function getConversacionBot(id: string): Promise<ConversacionBot | null> {
  const { data, error } = await supabase
    .from('chatbot_conversaciones')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const mensajes = await listMensajesBot(id)
  return rowToConv(data as ConvRow, mensajes)
}

export async function listMensajesBot(conversacionId: string): Promise<MensajeChatbot[]> {
  const { data, error } = await supabase
    .from('chatbot_mensajes')
    .select('*')
    .eq('conversacion_id', conversacionId)
    .order('fecha', { ascending: true })
  if (error) throw error
  return (data as MsgRow[]).map(rowToMsg)
}

export async function crearConversacionBot(
  usuarioId: string | null,
  titulo = 'Nueva conversación',
): Promise<ConversacionBot> {
  const { data, error } = await supabase
    .from('chatbot_conversaciones')
    .insert({ usuario_id: usuarioId, titulo })
    .select('*')
    .single()
  if (error) throw error
  return rowToConv(data as ConvRow)
}

export async function pushMensajeBot(
  conversacionId: string,
  rol: 'user' | 'bot',
  texto: string,
  componentes?: ChatbotBlock[],
): Promise<MensajeChatbot> {
  const { data, error } = await supabase
    .from('chatbot_mensajes')
    .insert({
      conversacion_id: conversacionId,
      rol,
      texto,
      componentes: componentes && componentes.length ? componentes : null,
    })
    .select('*')
    .single()
  if (error) throw error
  return rowToMsg(data as MsgRow)
}

export async function actualizarTituloConversacionBot(id: string, titulo: string): Promise<void> {
  const { error } = await supabase.from('chatbot_conversaciones').update({ titulo }).eq('id', id)
  if (error) throw error
}
