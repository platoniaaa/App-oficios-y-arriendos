import { supabase } from '@/lib/supabase'
import type { Notificacion, TipoNotificacion } from '@/types'

interface NotifRow {
  id: string
  usuario_id: string
  tipo: TipoNotificacion
  titulo: string
  texto: string | null
  link: string | null
  fecha: string
  leida: boolean | null
}

function rowToNotif(r: NotifRow): Notificacion {
  return {
    id: r.id,
    usuarioId: r.usuario_id,
    tipo: r.tipo,
    titulo: r.titulo,
    texto: r.texto ?? '',
    link: r.link ?? undefined,
    fecha: r.fecha,
    leida: r.leida ?? false,
  }
}

export async function listNotificaciones(usuarioId: string): Promise<Notificacion[]> {
  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('fecha', { ascending: false })
  if (error) {
    console.error('[listNotificaciones]', error)
    return []
  }
  return (data ?? []).map((r) => rowToNotif(r as NotifRow))
}

export async function pushNotificacion(input: {
  usuario_id: string
  tipo: TipoNotificacion
  titulo: string
  texto?: string
  link?: string
}) {
  const { error } = await supabase.from('notificaciones').insert(input)
  if (error) console.error('[pushNotificacion]', error)
}

export async function marcarNotifLeida(id: string) {
  await supabase.from('notificaciones').update({ leida: true }).eq('id', id)
}

export async function marcarTodasLeidas(usuarioId: string) {
  await supabase.from('notificaciones').update({ leida: true }).eq('usuario_id', usuarioId)
}

export function subscribeToNotificaciones(usuarioId: string, onChange: () => void) {
  const channel = supabase
    .channel(`notif:${usuarioId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notificaciones',
        filter: `usuario_id=eq.${usuarioId}`,
      },
      onChange,
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}
