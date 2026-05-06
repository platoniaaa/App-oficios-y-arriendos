import type { ServicioOficio } from '@/types'

// Producción real: los servicios viven en Supabase (tabla servicios_oficios).
// Este archivo queda vacío. La búsqueda y los detalles consultan la BD.
export const servicios: ServicioOficio[] = []

export const serviciosById: Record<string, ServicioOficio> = {}
