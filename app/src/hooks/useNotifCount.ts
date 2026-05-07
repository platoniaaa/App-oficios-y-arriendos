import { useEffect, useState } from 'react'
import { listNotificaciones, subscribeToNotificaciones } from '@/lib/queries/notificaciones'

/** Devuelve el conteo de notificaciones no leídas + reactivo a Realtime. */
export function useNotifCount(userId: string | undefined): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!userId) {
      setCount(0)
      return
    }
    let unsub: (() => void) | undefined
    async function load() {
      if (!userId) return
      const all = await listNotificaciones(userId)
      setCount(all.filter((n) => !n.leida).length)
    }
    load()
    unsub = subscribeToNotificaciones(userId, () => load())
    return () => unsub?.()
  }, [userId])

  return count
}
