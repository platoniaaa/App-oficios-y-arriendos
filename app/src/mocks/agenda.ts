import type { BloqueoCalendario, HorarioLaboral } from '@/types'

// Configuración por defecto del producto. Cuando un trabajador entra al
// panel por primera vez, este es el horario que ve hasta que lo edite.
export const horarioDefault: HorarioLaboral[] = [
  { dia: 'lun', abierto: true, desde: '08:00', hasta: '18:00' },
  { dia: 'mar', abierto: true, desde: '08:00', hasta: '18:00' },
  { dia: 'mie', abierto: true, desde: '08:00', hasta: '18:00' },
  { dia: 'jue', abierto: true, desde: '08:00', hasta: '18:00' },
  { dia: 'vie', abierto: true, desde: '08:00', hasta: '17:00' },
  { dia: 'sab', abierto: true, desde: '09:00', hasta: '14:00' },
  { dia: 'dom', abierto: false },
]

// Producción real: bloqueos viven en Supabase (tabla bloqueos_calendario).
export const bloqueos: BloqueoCalendario[] = []

export function bloqueosDeUsuario(_userId: string): BloqueoCalendario[] {
  return []
}
