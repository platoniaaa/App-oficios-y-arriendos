import type { Contratacion } from '@/types'
import { fees } from '@/config/brand'

export const contratacionesSeed: Contratacion[] = [
  {
    id: 'co-1001',
    tipo: 'servicio',
    clienteId: 'u-demo-cliente',
    ofertanteId: 'u-04',
    itemId: 's-02',
    fechaSolicitud: '2026-04-14',
    fechaInicio: '2026-04-22',
    monto: 180000,
    comision: Math.round(180000 * fees.comisionPlataforma),
    total: Math.round(180000 * (1 + fees.comisionPlataforma)),
    estado: 'pago_en_escrow',
    descripcionTrabajo:
      'Cambio de tablero eléctrico en departamento de 65 m². Incluye 12 circuitos protegidos y revisión general.',
    historialEstados: [
      { estado: 'solicitada', fecha: '2026-04-14' },
      { estado: 'cotizada', fecha: '2026-04-14' },
      { estado: 'aceptada_cliente', fecha: '2026-04-15' },
      { estado: 'pago_en_escrow', fecha: '2026-04-15' },
    ],
  },
  {
    id: 'co-1002',
    tipo: 'arriendo',
    clienteId: 'u-demo-cliente',
    ofertanteId: 'u-12',
    itemId: 'h-04',
    fechaSolicitud: '2026-04-10',
    fechaInicio: '2026-04-18',
    fechaFin: '2026-04-22',
    monto: 72000,
    comision: Math.round(72000 * fees.comisionPlataforma),
    deposito: 120000,
    total: Math.round(72000 * (1 + fees.comisionPlataforma)) + 120000,
    estado: 'en_ejecucion',
    historialEstados: [
      { estado: 'solicitada', fecha: '2026-04-10' },
      { estado: 'aceptada_cliente', fecha: '2026-04-10' },
      { estado: 'pago_en_escrow', fecha: '2026-04-11' },
      { estado: 'en_ejecucion', fecha: '2026-04-18' },
    ],
  },
  {
    id: 'co-1003',
    tipo: 'servicio',
    clienteId: 'u-19',
    ofertanteId: 'u-demo-trabajador',
    itemId: 's-01',
    fechaSolicitud: '2026-04-12',
    fechaInicio: '2026-04-16',
    monto: 45000,
    comision: Math.round(45000 * fees.comisionPlataforma),
    total: Math.round(45000 * (1 + fees.comisionPlataforma)),
    estado: 'finalizada_pendiente_aprobacion',
    descripcionTrabajo: 'Reparación de fuga en lavamanos del baño principal.',
    historialEstados: [
      { estado: 'solicitada', fecha: '2026-04-12' },
      { estado: 'cotizada', fecha: '2026-04-12' },
      { estado: 'aceptada_cliente', fecha: '2026-04-13' },
      { estado: 'pago_en_escrow', fecha: '2026-04-13' },
      { estado: 'en_ejecucion', fecha: '2026-04-16' },
      { estado: 'finalizada_pendiente_aprobacion', fecha: '2026-04-16' },
    ],
  },
  {
    id: 'co-1004',
    tipo: 'arriendo',
    clienteId: 'u-20',
    ofertanteId: 'u-demo-arrendador',
    itemId: 'h-01',
    fechaSolicitud: '2026-04-03',
    fechaInicio: '2026-04-08',
    fechaFin: '2026-04-12',
    monto: 1120000,
    comision: Math.round(1120000 * fees.comisionPlataforma),
    deposito: 400000,
    total: Math.round(1120000 * (1 + fees.comisionPlataforma)) + 400000,
    estado: 'liberado',
    historialEstados: [
      { estado: 'solicitada', fecha: '2026-04-03' },
      { estado: 'aceptada_cliente', fecha: '2026-04-03' },
      { estado: 'pago_en_escrow', fecha: '2026-04-04' },
      { estado: 'en_ejecucion', fecha: '2026-04-08' },
      { estado: 'finalizada_pendiente_aprobacion', fecha: '2026-04-12' },
      { estado: 'liberado', fecha: '2026-04-13' },
    ],
  },
  {
    id: 'co-1005',
    tipo: 'servicio',
    clienteId: 'u-demo-cliente',
    ofertanteId: 'u-07',
    itemId: 's-05',
    fechaSolicitud: '2026-04-18',
    fechaInicio: '2026-04-26',
    monto: 120000,
    comision: Math.round(120000 * fees.comisionPlataforma),
    total: Math.round(120000 * (1 + fees.comisionPlataforma)),
    estado: 'cotizada',
    descripcionTrabajo:
      'Mantención mensual de jardín de 80 m². Poda, riego, fertilización.',
    historialEstados: [
      { estado: 'solicitada', fecha: '2026-04-18' },
      { estado: 'cotizada', fecha: '2026-04-18' },
    ],
  },
  // Historial trabajador demo (u-demo-trabajador como ofertante)
  ...trabajadorHistorial(),
  // Historial arrendador demo (u-demo-arrendador como ofertante)
  ...arrendadorHistorial(),
]

type ContratacionSimple = {
  id: string
  tipo: 'servicio' | 'arriendo'
  clienteId: string
  ofertanteId: string
  itemId: string
  fechaSolicitud: string
  fechaInicio: string
  fechaFin?: string
  monto: number
  deposito?: number
  estado: 'liberado' | 'en_ejecucion' | 'pago_en_escrow' | 'solicitada' | 'cotizada' | 'finalizada_pendiente_aprobacion'
  descripcionTrabajo?: string
}

function pack(c: ContratacionSimple): import('@/types').Contratacion {
  const comision = Math.round(c.monto * fees.comisionPlataforma)
  const deposito = c.deposito ?? 0
  const total = c.monto + comision + deposito
  return {
    ...c,
    comision,
    total,
    historialEstados: [
      { estado: 'solicitada', fecha: c.fechaSolicitud },
      ...(c.estado === 'liberado' ? [
        { estado: 'cotizada' as const, fecha: c.fechaSolicitud },
        { estado: 'pago_en_escrow' as const, fecha: c.fechaSolicitud },
        { estado: 'en_ejecucion' as const, fecha: c.fechaInicio },
        { estado: 'finalizada_pendiente_aprobacion' as const, fecha: c.fechaFin ?? c.fechaInicio },
        { estado: 'liberado' as const, fecha: c.fechaFin ?? c.fechaInicio },
      ] : []),
    ],
  }
}

function trabajadorHistorial(): import('@/types').Contratacion[] {
  const src: ContratacionSimple[] = [
    { id: 'co-h1', tipo: 'servicio', clienteId: 'u-demo-cliente', ofertanteId: 'u-demo-trabajador', itemId: 's-01', fechaSolicitud: '2026-03-30', fechaInicio: '2026-04-01', fechaFin: '2026-04-02', monto: 45000, estado: 'liberado', descripcionTrabajo: 'Reparación fuga en lavamanos.' },
    { id: 'co-h2', tipo: 'servicio', clienteId: 'u-11', ofertanteId: 'u-demo-trabajador', itemId: 's-16', fechaSolicitud: '2026-03-20', fechaInicio: '2026-03-24', fechaFin: '2026-03-25', monto: 65000, estado: 'liberado' },
    { id: 'co-h3', tipo: 'servicio', clienteId: 'u-19', ofertanteId: 'u-demo-trabajador', itemId: 's-01', fechaSolicitud: '2026-03-16', fechaInicio: '2026-03-17', fechaFin: '2026-03-18', monto: 55000, estado: 'liberado' },
    { id: 'co-h4', tipo: 'servicio', clienteId: 'u-20', ofertanteId: 'u-demo-trabajador', itemId: 's-01', fechaSolicitud: '2026-03-05', fechaInicio: '2026-03-06', fechaFin: '2026-03-08', monto: 180000, estado: 'liberado' },
    { id: 'co-h5', tipo: 'servicio', clienteId: 'u-14', ofertanteId: 'u-demo-trabajador', itemId: 's-16', fechaSolicitud: '2026-02-25', fechaInicio: '2026-02-27', fechaFin: '2026-02-28', monto: 130000, estado: 'liberado' },
    { id: 'co-h6', tipo: 'servicio', clienteId: 'u-07', ofertanteId: 'u-demo-trabajador', itemId: 's-01', fechaSolicitud: '2026-02-10', fechaInicio: '2026-02-12', fechaFin: '2026-02-14', monto: 210000, estado: 'liberado' },
    { id: 'co-h7', tipo: 'servicio', clienteId: 'u-21', ofertanteId: 'u-demo-trabajador', itemId: 's-01', fechaSolicitud: '2026-01-28', fechaInicio: '2026-01-29', fechaFin: '2026-01-30', monto: 95000, estado: 'liberado' },
    { id: 'co-h8', tipo: 'servicio', clienteId: 'u-11', ofertanteId: 'u-demo-trabajador', itemId: 's-01', fechaSolicitud: '2026-01-10', fechaInicio: '2026-01-13', fechaFin: '2026-01-15', monto: 70000, estado: 'liberado' },
    { id: 'co-h9', tipo: 'servicio', clienteId: 'u-05', ofertanteId: 'u-demo-trabajador', itemId: 's-16', fechaSolicitud: '2026-01-02', fechaInicio: '2026-01-04', fechaFin: '2026-01-05', monto: 150000, estado: 'liberado' },
    { id: 'co-h10', tipo: 'servicio', clienteId: 'u-18', ofertanteId: 'u-demo-trabajador', itemId: 's-01', fechaSolicitud: '2025-12-18', fechaInicio: '2025-12-20', fechaFin: '2025-12-22', monto: 85000, estado: 'liberado' },
    { id: 'co-h11', tipo: 'servicio', clienteId: 'u-demo-cliente', ofertanteId: 'u-demo-trabajador', itemId: 's-01', fechaSolicitud: '2025-12-05', fechaInicio: '2025-12-09', fechaFin: '2025-12-10', monto: 60000, estado: 'liberado' },
    { id: 'co-h12', tipo: 'servicio', clienteId: 'u-06', ofertanteId: 'u-demo-trabajador', itemId: 's-01', fechaSolicitud: '2025-11-20', fechaInicio: '2025-11-26', fechaFin: '2025-11-28', monto: 120000, estado: 'liberado' },
    { id: 'co-h13', tipo: 'servicio', clienteId: 'u-15', ofertanteId: 'u-demo-trabajador', itemId: 's-16', fechaSolicitud: '2025-11-08', fechaInicio: '2025-11-12', fechaFin: '2025-11-15', monto: 180000, estado: 'liberado' },
    { id: 'co-h14', tipo: 'servicio', clienteId: 'u-19', ofertanteId: 'u-demo-trabajador', itemId: 's-01', fechaSolicitud: '2025-10-28', fechaInicio: '2025-11-01', fechaFin: '2025-11-02', monto: 55000, estado: 'liberado' },
    { id: 'co-h15', tipo: 'servicio', clienteId: 'u-07', ofertanteId: 'u-demo-trabajador', itemId: 's-01', fechaSolicitud: '2025-10-18', fechaInicio: '2025-10-23', fechaFin: '2025-10-25', monto: 90000, estado: 'liberado' },
    // solicitudes y cotizaciones recientes (para panel solicitudes)
    { id: 'co-h-new-1', tipo: 'servicio', clienteId: 'u-06', ofertanteId: 'u-demo-trabajador', itemId: 's-16', fechaSolicitud: '2026-04-18', fechaInicio: '2026-04-25', monto: 80000, estado: 'solicitada', descripcionTrabajo: 'Cambio calefont en casa de 2 pisos. Necesito cotización.' },
    { id: 'co-h-new-2', tipo: 'servicio', clienteId: 'u-19', ofertanteId: 'u-demo-trabajador', itemId: 's-01', fechaSolicitud: '2026-04-17', fechaInicio: '2026-04-22', monto: 45000, estado: 'solicitada', descripcionTrabajo: 'Revisión de filtración en techo del baño.' },
    { id: 'co-h-new-3', tipo: 'servicio', clienteId: 'u-14', ofertanteId: 'u-demo-trabajador', itemId: 's-01', fechaSolicitud: '2026-04-14', fechaInicio: '2026-04-21', monto: 110000, estado: 'cotizada', descripcionTrabajo: 'Instalación de 3 artefactos en departamento nuevo.' },
    { id: 'co-h-new-4', tipo: 'servicio', clienteId: 'u-05', ofertanteId: 'u-demo-trabajador', itemId: 's-16', fechaSolicitud: '2026-04-12', fechaInicio: '2026-04-20', monto: 160000, estado: 'pago_en_escrow', descripcionTrabajo: 'Cambio calefont condominio.' },
    { id: 'co-h-new-5', tipo: 'servicio', clienteId: 'u-11', ofertanteId: 'u-demo-trabajador', itemId: 's-01', fechaSolicitud: '2026-04-08', fechaInicio: '2026-04-15', monto: 90000, estado: 'en_ejecucion', descripcionTrabajo: 'Reemplazo de cañerías de agua fría.' },
    { id: 'co-h-new-6', tipo: 'servicio', clienteId: 'u-18', ofertanteId: 'u-demo-trabajador', itemId: 's-01', fechaSolicitud: '2026-04-05', fechaInicio: '2026-04-10', fechaFin: '2026-04-12', monto: 75000, estado: 'finalizada_pendiente_aprobacion', descripcionTrabajo: 'Reparación urgente fuga de gas.' },
  ]
  return src.map(pack)
}

function arrendadorHistorial(): import('@/types').Contratacion[] {
  const src: ContratacionSimple[] = [
    { id: 'co-a1', tipo: 'arriendo', clienteId: 'u-20', ofertanteId: 'u-demo-arrendador', itemId: 'h-01', fechaSolicitud: '2026-03-30', fechaInicio: '2026-04-02', fechaFin: '2026-04-06', monto: 1120000, deposito: 400000, estado: 'liberado' },
    { id: 'co-a2', tipo: 'arriendo', clienteId: 'u-11', ofertanteId: 'u-demo-arrendador', itemId: 'h-01', fechaSolicitud: '2026-03-20', fechaInicio: '2026-03-22', fechaFin: '2026-03-24', monto: 560000, deposito: 400000, estado: 'liberado' },
    { id: 'co-a3', tipo: 'arriendo', clienteId: 'u-15', ofertanteId: 'u-demo-arrendador', itemId: 'h-05', fechaSolicitud: '2026-03-10', fechaInicio: '2026-03-12', fechaFin: '2026-03-15', monto: 660000, deposito: 350000, estado: 'liberado' },
    { id: 'co-a4', tipo: 'arriendo', clienteId: 'u-06', ofertanteId: 'u-demo-arrendador', itemId: 'h-18', fechaSolicitud: '2026-02-28', fechaInicio: '2026-03-02', fechaFin: '2026-03-05', monto: 495000, deposito: 500000, estado: 'liberado' },
    { id: 'co-a5', tipo: 'arriendo', clienteId: 'u-05', ofertanteId: 'u-demo-arrendador', itemId: 'h-05', fechaSolicitud: '2026-02-14', fechaInicio: '2026-02-16', fechaFin: '2026-02-18', monto: 440000, deposito: 350000, estado: 'liberado' },
    { id: 'co-a6', tipo: 'arriendo', clienteId: 'u-20', ofertanteId: 'u-demo-arrendador', itemId: 'h-01', fechaSolicitud: '2026-02-01', fechaInicio: '2026-02-03', fechaFin: '2026-02-05', monto: 560000, deposito: 400000, estado: 'liberado' },
    { id: 'co-a7', tipo: 'arriendo', clienteId: 'u-14', ofertanteId: 'u-demo-arrendador', itemId: 'h-19', fechaSolicitud: '2026-01-24', fechaInicio: '2026-01-26', fechaFin: '2026-01-28', monto: 640000, deposito: 500000, estado: 'liberado' },
    { id: 'co-a8', tipo: 'arriendo', clienteId: 'u-15', ofertanteId: 'u-demo-arrendador', itemId: 'h-17', fechaSolicitud: '2026-01-10', fechaInicio: '2026-01-12', fechaFin: '2026-01-14', monto: 114000, deposito: 180000, estado: 'liberado' },
    { id: 'co-a9', tipo: 'arriendo', clienteId: 'u-11', ofertanteId: 'u-demo-arrendador', itemId: 'h-01', fechaSolicitud: '2025-12-22', fechaInicio: '2025-12-26', fechaFin: '2025-12-28', monto: 560000, deposito: 400000, estado: 'liberado' },
    { id: 'co-a10', tipo: 'arriendo', clienteId: 'u-20', ofertanteId: 'u-demo-arrendador', itemId: 'h-05', fechaSolicitud: '2025-12-12', fechaInicio: '2025-12-15', fechaFin: '2025-12-18', monto: 660000, deposito: 350000, estado: 'liberado' },
    { id: 'co-a11', tipo: 'arriendo', clienteId: 'u-18', ofertanteId: 'u-demo-arrendador', itemId: 'h-01', fechaSolicitud: '2025-12-01', fechaInicio: '2025-12-03', fechaFin: '2025-12-05', monto: 560000, deposito: 400000, estado: 'liberado' },
    { id: 'co-a12', tipo: 'arriendo', clienteId: 'u-06', ofertanteId: 'u-demo-arrendador', itemId: 'h-18', fechaSolicitud: '2025-11-20', fechaInicio: '2025-11-22', fechaFin: '2025-11-24', monto: 330000, deposito: 500000, estado: 'liberado' },
    { id: 'co-a13', tipo: 'arriendo', clienteId: 'u-11', ofertanteId: 'u-demo-arrendador', itemId: 'h-01', fechaSolicitud: '2025-11-08', fechaInicio: '2025-11-10', fechaFin: '2025-11-11', monto: 280000, deposito: 400000, estado: 'liberado' },
    { id: 'co-a14', tipo: 'arriendo', clienteId: 'u-15', ofertanteId: 'u-demo-arrendador', itemId: 'h-01', fechaSolicitud: '2025-10-28', fechaInicio: '2025-10-30', fechaFin: '2025-10-31', monto: 280000, deposito: 400000, estado: 'liberado' },
    { id: 'co-a15', tipo: 'arriendo', clienteId: 'u-05', ofertanteId: 'u-demo-arrendador', itemId: 'h-17', fechaSolicitud: '2025-10-15', fechaInicio: '2025-10-17', fechaFin: '2025-10-19', monto: 114000, deposito: 180000, estado: 'liberado' },
    { id: 'co-a16', tipo: 'arriendo', clienteId: 'u-14', ofertanteId: 'u-demo-arrendador', itemId: 'h-05', fechaSolicitud: '2025-10-02', fechaInicio: '2025-10-05', fechaFin: '2025-10-06', monto: 220000, deposito: 350000, estado: 'liberado' },
    { id: 'co-a17', tipo: 'arriendo', clienteId: 'u-20', ofertanteId: 'u-demo-arrendador', itemId: 'h-18', fechaSolicitud: '2025-09-18', fechaInicio: '2025-09-20', fechaFin: '2025-09-24', monto: 660000, deposito: 500000, estado: 'liberado' },
    { id: 'co-a18', tipo: 'arriendo', clienteId: 'u-08', ofertanteId: 'u-demo-arrendador', itemId: 'h-17', fechaSolicitud: '2025-09-05', fechaInicio: '2025-09-08', fechaFin: '2025-09-10', monto: 114000, deposito: 180000, estado: 'liberado' },
    { id: 'co-a19', tipo: 'arriendo', clienteId: 'u-18', ofertanteId: 'u-demo-arrendador', itemId: 'h-01', fechaSolicitud: '2025-08-22', fechaInicio: '2025-08-25', fechaFin: '2025-08-28', monto: 840000, deposito: 400000, estado: 'liberado' },
    { id: 'co-a20', tipo: 'arriendo', clienteId: 'u-11', ofertanteId: 'u-demo-arrendador', itemId: 'h-05', fechaSolicitud: '2025-08-05', fechaInicio: '2025-08-07', fechaFin: '2025-08-09', monto: 440000, deposito: 350000, estado: 'liberado' },
    { id: 'co-a21', tipo: 'arriendo', clienteId: 'u-15', ofertanteId: 'u-demo-arrendador', itemId: 'h-01', fechaSolicitud: '2025-07-25', fechaInicio: '2025-07-27', fechaFin: '2025-07-28', monto: 280000, deposito: 400000, estado: 'liberado' },
    { id: 'co-a22', tipo: 'arriendo', clienteId: 'u-20', ofertanteId: 'u-demo-arrendador', itemId: 'h-18', fechaSolicitud: '2025-07-12', fechaInicio: '2025-07-14', fechaFin: '2025-07-17', monto: 495000, deposito: 500000, estado: 'liberado' },
    { id: 'co-a23', tipo: 'arriendo', clienteId: 'u-05', ofertanteId: 'u-demo-arrendador', itemId: 'h-05', fechaSolicitud: '2025-06-28', fechaInicio: '2025-06-30', fechaFin: '2025-07-02', monto: 440000, deposito: 350000, estado: 'liberado' },
    { id: 'co-a24', tipo: 'arriendo', clienteId: 'u-08', ofertanteId: 'u-demo-arrendador', itemId: 'h-19', fechaSolicitud: '2025-06-15', fechaInicio: '2025-06-17', fechaFin: '2025-06-19', monto: 640000, deposito: 500000, estado: 'liberado' },
    { id: 'co-a25', tipo: 'arriendo', clienteId: 'u-06', ofertanteId: 'u-demo-arrendador', itemId: 'h-01', fechaSolicitud: '2025-06-01', fechaInicio: '2025-06-03', fechaFin: '2025-06-05', monto: 560000, deposito: 400000, estado: 'liberado' },
    { id: 'co-a26', tipo: 'arriendo', clienteId: 'u-14', ofertanteId: 'u-demo-arrendador', itemId: 'h-17', fechaSolicitud: '2025-05-20', fechaInicio: '2025-05-22', fechaFin: '2025-05-24', monto: 114000, deposito: 180000, estado: 'liberado' },
    { id: 'co-a27', tipo: 'arriendo', clienteId: 'u-18', ofertanteId: 'u-demo-arrendador', itemId: 'h-18', fechaSolicitud: '2025-05-08', fechaInicio: '2025-05-10', fechaFin: '2025-05-14', monto: 660000, deposito: 500000, estado: 'liberado' },
    { id: 'co-a28', tipo: 'arriendo', clienteId: 'u-11', ofertanteId: 'u-demo-arrendador', itemId: 'h-05', fechaSolicitud: '2025-04-24', fechaInicio: '2025-04-26', fechaFin: '2025-04-28', monto: 440000, deposito: 350000, estado: 'liberado' },
    // solicitudes / flujos activos
    { id: 'co-a-new-1', tipo: 'arriendo', clienteId: 'u-15', ofertanteId: 'u-demo-arrendador', itemId: 'h-01', fechaSolicitud: '2026-04-18', fechaInicio: '2026-04-25', fechaFin: '2026-04-29', monto: 1120000, deposito: 400000, estado: 'solicitada' },
    { id: 'co-a-new-2', tipo: 'arriendo', clienteId: 'u-08', ofertanteId: 'u-demo-arrendador', itemId: 'h-17', fechaSolicitud: '2026-04-17', fechaInicio: '2026-04-22', fechaFin: '2026-04-26', monto: 152000, deposito: 180000, estado: 'solicitada' },
    { id: 'co-a-new-3', tipo: 'arriendo', clienteId: 'u-20', ofertanteId: 'u-demo-arrendador', itemId: 'h-18', fechaSolicitud: '2026-04-12', fechaInicio: '2026-04-15', fechaFin: '2026-04-20', monto: 825000, deposito: 500000, estado: 'pago_en_escrow' },
    { id: 'co-a-new-4', tipo: 'arriendo', clienteId: 'u-06', ofertanteId: 'u-demo-arrendador', itemId: 'h-01', fechaSolicitud: '2026-04-10', fechaInicio: '2026-04-14', fechaFin: '2026-04-17', monto: 840000, deposito: 400000, estado: 'en_ejecucion' },
    { id: 'co-a-new-5', tipo: 'arriendo', clienteId: 'u-14', ofertanteId: 'u-demo-arrendador', itemId: 'h-05', fechaSolicitud: '2026-04-06', fechaInicio: '2026-04-08', fechaFin: '2026-04-12', monto: 880000, deposito: 350000, estado: 'finalizada_pendiente_aprobacion' },
  ]
  return src.map(pack)
}
