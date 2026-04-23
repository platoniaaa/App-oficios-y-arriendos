import type { BloqueoCalendario, HorarioLaboral } from '@/types'

export const horarioDefault: HorarioLaboral[] = [
  { dia: 'lun', abierto: true, desde: '08:00', hasta: '18:00' },
  { dia: 'mar', abierto: true, desde: '08:00', hasta: '18:00' },
  { dia: 'mie', abierto: true, desde: '08:00', hasta: '18:00' },
  { dia: 'jue', abierto: true, desde: '08:00', hasta: '18:00' },
  { dia: 'vie', abierto: true, desde: '08:00', hasta: '17:00' },
  { dia: 'sab', abierto: true, desde: '09:00', hasta: '14:00' },
  { dia: 'dom', abierto: false },
]

export const bloqueos: BloqueoCalendario[] = [
  {
    id: 'bl-1',
    usuarioId: 'u-demo-trabajador',
    desde: '2026-04-27',
    hasta: '2026-04-29',
    motivo: 'Capacitación SEC',
  },
  {
    id: 'bl-2',
    usuarioId: 'u-demo-trabajador',
    desde: '2026-05-15',
    hasta: '2026-05-18',
    motivo: 'Viaje familiar',
  },
  {
    id: 'bl-3',
    usuarioId: 'u-demo-arrendador',
    herramientaId: 'h-19',
    desde: '2026-04-20',
    hasta: '2026-04-24',
    motivo: 'Mantenimiento preventivo',
  },
]

export function bloqueosDeUsuario(userId: string) {
  return bloqueos.filter((b) => b.usuarioId === userId)
}
