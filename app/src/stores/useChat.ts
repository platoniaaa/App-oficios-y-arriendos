// Adaptador hacia las queries reales de Supabase. El chat real
// (lista, mensajes, realtime) está en lib/queries/chat.ts. Este shim
// solo expone `startOrGet` para los componentes que lo llaman al
// abrir un chat 1:1.
import { findOrCreateConversacion } from '@/lib/queries/chat'
import type { Conversacion } from '@/types'

interface State {
  startOrGet: (a: string, b: string, contratacionId?: string) => Promise<Conversacion>
}

const store: State = {
  startOrGet: (a, b, contratacionId) => findOrCreateConversacion(a, b, contratacionId),
}

export function useChat<T = State>(selector?: (s: State) => T): T {
  return selector ? selector(store) : (store as unknown as T)
}
