import { useAuth } from '@/stores/useAuth'
import type { User } from '@/types'

/**
 * Reemplaza `useAuth((s) => s.user())!` evitando el non-null assertion.
 * Devuelve null cuando el user aún no se cargó; los componentes que la usan
 * deben hacer early return en ese caso (idealmente acompañado de un
 * <Navigate to="/login" />, aunque PrivateRoute ya cubre el caso final).
 */
export function useUser(): User | null {
  return useAuth((s) => s.user())
}
