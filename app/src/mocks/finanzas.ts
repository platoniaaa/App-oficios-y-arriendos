import type { MovimientoFinanciero } from '@/types'

// Producción real: movimientos financieros viven en Supabase
// (tabla movimientos_financieros). Sin datos hasta que ocurran transacciones.
export const movimientos: MovimientoFinanciero[] = []

export function movimientosDeUsuario(_usuarioId: string): MovimientoFinanciero[] {
  return []
}

export function ingresoPorMes(_usuarioId: string): { mes: string; monto: number }[] {
  return ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'].map((m) => ({ mes: m, monto: 0 }))
}

export function resumenFinanciero(_usuarioId: string) {
  return {
    ingresoTotal: 0,
    enEscrow: 0,
    retirado: 0,
    disponible: 0,
    depositosCustodia: 0,
    ingresoMes: 0,
  }
}
