// Adaptador hacia las queries reales de Supabase.
// `push` es fire-and-forget. Para el contador "no leídas" usar
// el hook useNotifCount() con suscripción Realtime (más abajo).
import { pushNotificacion } from '@/lib/queries/notificaciones'
import type { TipoNotificacion } from '@/types'

interface PushInput {
  usuarioId: string
  tipo: TipoNotificacion
  titulo: string
  texto?: string
  link?: string
}

interface State {
  push: (n: PushInput) => void
}

const store: State = {
  push: (n) =>
    void pushNotificacion({
      usuario_id: n.usuarioId,
      tipo: n.tipo,
      titulo: n.titulo,
      texto: n.texto,
      link: n.link,
    }),
}

export function useNotificaciones<T = State>(selector?: (s: State) => T): T {
  return selector ? selector(store) : (store as unknown as T)
}
