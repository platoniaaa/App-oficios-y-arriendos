import { useEffect, useState } from 'react'
import { listConversaciones, subscribeToConversaciones } from '@/lib/queries/chat'

/**
 * Cuenta de conversaciones con mensajes sin leer para el usuario.
 * Reactivo: se actualiza cuando llega un mensaje nuevo o se marcan como leídos.
 */
export function useChatUnreadCount(userId: string | undefined): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!userId) {
      setCount(0)
      return
    }
    let unsub: (() => void) | undefined
    async function load() {
      if (!userId) return
      const convs = await listConversaciones(userId)
      setCount(convs.filter((c) => c.noLeidos > 0).length)
    }
    load()
    unsub = subscribeToConversaciones(userId, () => load())
    return () => unsub?.()
  }, [userId])

  return count
}
