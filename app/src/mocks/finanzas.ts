import type { MovimientoFinanciero } from '@/types'

// Genera 6 meses de ingresos (nov 2025 → abr 2026) con variación realista
function mesIso(year: number, month: number, day: number) {
  return new Date(year, month - 1, day).toISOString()
}

const trabajadorMovs: MovimientoFinanciero[] = [
  // noviembre
  { id: 'mv-t-01', usuarioId: 'u-demo-trabajador', fecha: mesIso(2025, 11, 4), tipo: 'ingreso', monto: 45000, descripcion: 'Reparación lavamanos — Ñuñoa', estado: 'liquidado' },
  { id: 'mv-t-02', usuarioId: 'u-demo-trabajador', fecha: mesIso(2025, 11, 11), tipo: 'ingreso', monto: 65000, descripcion: 'Instalación calefont — Maipú', estado: 'liquidado' },
  { id: 'mv-t-03', usuarioId: 'u-demo-trabajador', fecha: mesIso(2025, 11, 18), tipo: 'ingreso', monto: 120000, descripcion: 'Cambio de cañerías — Santiago centro', estado: 'liquidado' },
  { id: 'mv-t-04', usuarioId: 'u-demo-trabajador', fecha: mesIso(2025, 11, 27), tipo: 'ingreso', monto: 85000, descripcion: 'Visita + reparación — Pudahuel', estado: 'liquidado' },
  { id: 'mv-t-05', usuarioId: 'u-demo-trabajador', fecha: mesIso(2025, 11, 28), tipo: 'retiro', monto: -250000, descripcion: 'Retiro a Banco Estado', estado: 'liquidado' },
  // diciembre (alta temporada)
  { id: 'mv-t-06', usuarioId: 'u-demo-trabajador', fecha: mesIso(2025, 12, 2), tipo: 'ingreso', monto: 150000, descripcion: 'Remodelación baño — Estación Central', estado: 'liquidado' },
  { id: 'mv-t-07', usuarioId: 'u-demo-trabajador', fecha: mesIso(2025, 12, 9), tipo: 'ingreso', monto: 90000, descripcion: 'Urgencia filtración — Maipú', estado: 'liquidado' },
  { id: 'mv-t-08', usuarioId: 'u-demo-trabajador', fecha: mesIso(2025, 12, 14), tipo: 'ingreso', monto: 180000, descripcion: 'Instalación red gas — Cerrillos', estado: 'liquidado' },
  { id: 'mv-t-09', usuarioId: 'u-demo-trabajador', fecha: mesIso(2025, 12, 20), tipo: 'ingreso', monto: 60000, descripcion: 'Cambio artefactos baño — Santiago', estado: 'liquidado' },
  { id: 'mv-t-10', usuarioId: 'u-demo-trabajador', fecha: mesIso(2025, 12, 22), tipo: 'retiro', monto: -400000, descripcion: 'Retiro a Banco Estado', estado: 'liquidado' },
  // enero
  { id: 'mv-t-11', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 1, 8), tipo: 'ingreso', monto: 35000, descripcion: 'Diagnóstico + reparación — Quilicura', estado: 'liquidado' },
  { id: 'mv-t-12', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 1, 15), tipo: 'ingreso', monto: 95000, descripcion: 'Mantención calefont — Pudahuel', estado: 'liquidado' },
  { id: 'mv-t-13', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 1, 22), tipo: 'ingreso', monto: 120000, descripcion: 'Cambio tablero gas — Maipú', estado: 'liquidado' },
  { id: 'mv-t-14', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 1, 28), tipo: 'retiro', monto: -200000, descripcion: 'Retiro a Banco Estado', estado: 'liquidado' },
  // febrero
  { id: 'mv-t-15', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 2, 5), tipo: 'ingreso', monto: 210000, descripcion: 'Proyecto baño completo — Ñuñoa', estado: 'liquidado' },
  { id: 'mv-t-16', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 2, 14), tipo: 'ingreso', monto: 55000, descripcion: 'Reparación urgente — Santiago', estado: 'liquidado' },
  { id: 'mv-t-17', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 2, 20), tipo: 'ingreso', monto: 130000, descripcion: 'Instalación baños nuevos — Cerrillos', estado: 'liquidado' },
  { id: 'mv-t-18', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 2, 25), tipo: 'retiro', monto: -300000, descripcion: 'Retiro a Banco Estado', estado: 'liquidado' },
  // marzo
  { id: 'mv-t-19', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 3, 3), tipo: 'ingreso', monto: 70000, descripcion: 'Inspección + ajustes — Maipú', estado: 'liquidado' },
  { id: 'mv-t-20', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 3, 11), tipo: 'ingreso', monto: 155000, descripcion: 'Fuga + reemplazo lavaplatos — Santiago', estado: 'liquidado' },
  { id: 'mv-t-21', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 3, 18), tipo: 'ingreso', monto: 80000, descripcion: 'Calefont nuevo — Pudahuel', estado: 'liquidado' },
  { id: 'mv-t-22', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 3, 26), tipo: 'ingreso', monto: 200000, descripcion: 'Instalación gas oficina — Cerrillos', estado: 'liquidado' },
  { id: 'mv-t-23', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 3, 28), tipo: 'retiro', monto: -450000, descripcion: 'Retiro a Banco Estado', estado: 'liquidado' },
  // abril (mes en curso)
  { id: 'mv-t-24', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 4, 2), tipo: 'ingreso', monto: 45000, descripcion: 'Reseña Fernanda — reparación baño', estado: 'liquidado' },
  { id: 'mv-t-25', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 4, 10), tipo: 'ingreso', monto: 160000, descripcion: 'Cambio calefont condominio — Maipú', estado: 'en_escrow' },
  { id: 'mv-t-26', usuarioId: 'u-demo-trabajador', fecha: mesIso(2026, 4, 15), tipo: 'ingreso', monto: 90000, descripcion: 'Reparación fuga — Santiago', estado: 'en_escrow' },
]

const arrendadorMovs: MovimientoFinanciero[] = [
  // noviembre
  { id: 'mv-a-01', usuarioId: 'u-demo-arrendador', fecha: mesIso(2025, 11, 5), tipo: 'ingreso', monto: 1400000, descripcion: 'Retro Cat 420F · 5 días · obra Quilicura', estado: 'liquidado' },
  { id: 'mv-a-02', usuarioId: 'u-demo-arrendador', fecha: mesIso(2025, 11, 12), tipo: 'ingreso', monto: 660000, descripcion: 'Bobcat S550 · 3 días · Pudahuel', estado: 'liquidado' },
  { id: 'mv-a-03', usuarioId: 'u-demo-arrendador', fecha: mesIso(2025, 11, 20), tipo: 'ingreso', monto: 380000, descripcion: 'Martillo demoledor · 10 días', estado: 'liquidado' },
  { id: 'mv-a-04', usuarioId: 'u-demo-arrendador', fecha: mesIso(2025, 11, 28), tipo: 'retiro', monto: -2000000, descripcion: 'Retiro a cuenta empresa', estado: 'liquidado' },
  // diciembre
  { id: 'mv-a-05', usuarioId: 'u-demo-arrendador', fecha: mesIso(2025, 12, 3), tipo: 'ingreso', monto: 1120000, descripcion: 'Retro · 4 días · San Bernardo', estado: 'liquidado' },
  { id: 'mv-a-06', usuarioId: 'u-demo-arrendador', fecha: mesIso(2025, 12, 10), tipo: 'ingreso', monto: 825000, descripcion: 'Plataforma elevadora · 5 días', estado: 'liquidado' },
  { id: 'mv-a-07', usuarioId: 'u-demo-arrendador', fecha: mesIso(2025, 12, 18), tipo: 'ingreso', monto: 1920000, descripcion: 'Camión grúa · 6 días · obra gruesa', estado: 'liquidado' },
  { id: 'mv-a-08', usuarioId: 'u-demo-arrendador', fecha: mesIso(2025, 12, 22), tipo: 'retiro', monto: -3000000, descripcion: 'Retiro a cuenta empresa', estado: 'liquidado' },
  // enero (baja temporada)
  { id: 'mv-a-09', usuarioId: 'u-demo-arrendador', fecha: mesIso(2026, 1, 15), tipo: 'ingreso', monto: 560000, descripcion: 'Bobcat · 2 días', estado: 'liquidado' },
  { id: 'mv-a-10', usuarioId: 'u-demo-arrendador', fecha: mesIso(2026, 1, 25), tipo: 'ingreso', monto: 760000, descripcion: 'Plataforma · 4 días', estado: 'liquidado' },
  // febrero
  { id: 'mv-a-11', usuarioId: 'u-demo-arrendador', fecha: mesIso(2026, 2, 7), tipo: 'ingreso', monto: 1680000, descripcion: 'Retro · 6 días · proyecto Pudahuel', estado: 'liquidado' },
  { id: 'mv-a-12', usuarioId: 'u-demo-arrendador', fecha: mesIso(2026, 2, 15), tipo: 'ingreso', monto: 450000, descripcion: 'Martillo + andamios · 10 días', estado: 'liquidado' },
  { id: 'mv-a-13', usuarioId: 'u-demo-arrendador', fecha: mesIso(2026, 2, 24), tipo: 'retiro', monto: -2200000, descripcion: 'Retiro a cuenta empresa', estado: 'liquidado' },
  // marzo
  { id: 'mv-a-14', usuarioId: 'u-demo-arrendador', fecha: mesIso(2026, 3, 5), tipo: 'ingreso', monto: 2240000, descripcion: 'Retro · 8 días · ampliación', estado: 'liquidado' },
  { id: 'mv-a-15', usuarioId: 'u-demo-arrendador', fecha: mesIso(2026, 3, 14), tipo: 'ingreso', monto: 990000, descripcion: 'Plataforma + elevador · 6 días', estado: 'liquidado' },
  { id: 'mv-a-16', usuarioId: 'u-demo-arrendador', fecha: mesIso(2026, 3, 22), tipo: 'ingreso', monto: 1280000, descripcion: 'Camión grúa · 4 días', estado: 'liquidado' },
  { id: 'mv-a-17', usuarioId: 'u-demo-arrendador', fecha: mesIso(2026, 3, 30), tipo: 'retiro', monto: -3500000, descripcion: 'Retiro a cuenta empresa', estado: 'liquidado' },
  // abril
  { id: 'mv-a-18', usuarioId: 'u-demo-arrendador', fecha: mesIso(2026, 4, 5), tipo: 'ingreso', monto: 1120000, descripcion: 'Retro · 4 días · Pacheco EIRL', estado: 'liquidado' },
  { id: 'mv-a-19', usuarioId: 'u-demo-arrendador', fecha: mesIso(2026, 4, 12), tipo: 'ingreso', monto: 825000, descripcion: 'Plataforma · 5 días', estado: 'en_escrow' },
  { id: 'mv-a-20', usuarioId: 'u-demo-arrendador', fecha: mesIso(2026, 4, 18), tipo: 'deposito_entrada', monto: 500000, descripcion: 'Depósito Camión grúa — contrato #A-442', estado: 'en_escrow' },
]

export const movimientos: MovimientoFinanciero[] = [...trabajadorMovs, ...arrendadorMovs]

export function movimientosDeUsuario(usuarioId: string) {
  return movimientos.filter((m) => m.usuarioId === usuarioId).sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export function ingresoPorMes(usuarioId: string): { mes: string; monto: number }[] {
  const mapa: Record<string, number> = {}
  const meses = ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr']
  meses.forEach((m) => (mapa[m] = 0))
  const nombres = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  for (const mv of movimientos.filter((x) => x.usuarioId === usuarioId && x.tipo === 'ingreso')) {
    const d = new Date(mv.fecha)
    const key = nombres[d.getMonth()].charAt(0).toUpperCase() + nombres[d.getMonth()].slice(1, 3)
    if (mapa[key] !== undefined) mapa[key] += mv.monto
  }
  return meses.map((m) => ({ mes: m, monto: mapa[m] ?? 0 }))
}

export function resumenFinanciero(usuarioId: string) {
  const movs = movimientos.filter((m) => m.usuarioId === usuarioId)
  const ingresoTotal = movs.filter((m) => m.tipo === 'ingreso' && m.estado === 'liquidado').reduce((s, m) => s + m.monto, 0)
  const enEscrow = movs.filter((m) => m.estado === 'en_escrow').reduce((s, m) => s + m.monto, 0)
  const retirado = Math.abs(movs.filter((m) => m.tipo === 'retiro').reduce((s, m) => s + m.monto, 0))
  const disponible = ingresoTotal - retirado
  const depositosCustodia = movs.filter((m) => m.tipo === 'deposito_entrada').reduce((s, m) => s + m.monto, 0)
  const now = new Date()
  const mesActual = now.getMonth()
  const ingresoMes = movs
    .filter((m) => {
      const d = new Date(m.fecha)
      return m.tipo === 'ingreso' && d.getMonth() === mesActual && d.getFullYear() === now.getFullYear()
    })
    .reduce((s, m) => s + m.monto, 0)
  return { ingresoTotal, enEscrow, retirado, disponible, depositosCustodia, ingresoMes }
}
