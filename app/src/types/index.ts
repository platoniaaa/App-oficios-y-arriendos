export type UUID = string

export type Rol = 'cliente' | 'trabajador' | 'arrendador'

export type TipoCuenta = 'persona' | 'empresa'

export type EstadoVerificacion =
  | 'pendiente'
  | 'validada'
  | 'rechazada'
  | 'no_aplica'

export interface Certificacion {
  id: string
  nombre: string
  institucion?: string
  anio?: number
  archivo?: string
  estado: EstadoVerificacion
}

export interface User {
  id: UUID
  tipo: TipoCuenta
  nombre: string
  apellido?: string
  razonSocial?: string
  giro?: string
  rut: string
  email: string
  telefono: string
  fotoPerfil: string
  region: string
  comuna: string
  direccion?: string
  bio?: string
  roles: Rol[]
  verificacion: {
    rut: EstadoVerificacion
    cedula: EstadoVerificacion
    antecedentes: EstadoVerificacion
    certificaciones: EstadoVerificacion
  }
  calificacionPromedio: number
  totalResenas: number
  fechaRegistro: string
  idiomas?: string[]
  respuestaPromedioHrs?: number
  tasaRespuesta?: number
  tasaCumplimiento?: number
  tasaPuntualidad?: number
  tasaRecomendacion?: number
  totalTrabajosCompletados?: number
  totalArriendosCompletados?: number
  nuevoEnPlataforma?: boolean
  faq?: FaqItem[]
  representanteLegal?: string
}

export interface FaqItem {
  q: string
  a: string
}

export type TipoTarifaServicio = 'hora' | 'dia' | 'visita' | 'a_convenir'

export interface ServicioOficio {
  id: UUID
  trabajadorId: UUID
  oficio: string
  categorias: string[]
  descripcion: string
  experienciaAnios: number
  tarifaReferencia: {
    tipo: TipoTarifaServicio
    monto?: number
  }
  zonasCobertura: string[]
  disponibilidad: 'inmediata' | 'agendada' | 'ocupado'
  certificaciones: Certificacion[]
  galeriaTrabajos: string[]
  totalTrabajosRealizados: number
  calificacion: number
  faq?: { q: string; a: string }[]
}

export interface DateRange {
  desde: string
  hasta: string
}

export type EstadoHerramienta = 'nueva' | 'buena' | 'aceptable'
export type RetiroModalidad = 'domicilio_propietario' | 'delivery' | 'ambos'
export type EstadoOperacionalHerramienta = 'disponible' | 'arrendada' | 'mantenimiento' | 'pausada'

export interface Herramienta {
  id: UUID
  propietarioId: UUID
  titulo: string
  categoria: string
  subcategoria: string
  marca: string
  modelo: string
  descripcion: string
  fotos: string[]
  estado: EstadoHerramienta
  tarifa: {
    porHora?: number
    porDia?: number
    porSemana?: number
  }
  depositoGarantia: number
  requiereEntrega: boolean
  comunaUbicacion: string
  retiro: RetiroModalidad
  disponibilidad: DateRange[]
  totalArriendos: number
  calificacion: number
  estadoOperacional?: EstadoOperacionalHerramienta
  vistas?: number
}

export type TipoContratacion = 'servicio' | 'arriendo'

export type EstadoContratacion =
  | 'solicitada'
  | 'cotizada'
  | 'aceptada_cliente'
  | 'pago_en_escrow'
  | 'en_ejecucion'
  | 'finalizada_pendiente_aprobacion'
  | 'liberado'
  | 'cancelada'
  | 'en_disputa'

export interface Contratacion {
  id: UUID
  tipo: TipoContratacion
  clienteId: UUID
  ofertanteId: UUID
  itemId: UUID
  fechaSolicitud: string
  fechaInicio: string
  fechaFin?: string
  monto: number
  comision: number
  deposito?: number
  total: number
  estado: EstadoContratacion
  historialEstados: { estado: EstadoContratacion; fecha: string }[]
  notas?: string
  adjuntos?: { nombre: string; url: string }[]
  descripcionTrabajo?: string
}

export interface Resena {
  id: UUID
  contratacionId: UUID
  autorId: UUID
  destinoId: UUID
  estrellas: number
  subcategorias?: {
    puntualidad?: number
    calidad?: number
    comunicacion?: number
    precio?: number
    estadoEntrega?: number
  }
  comentario: string
  recomienda: boolean
  fecha: string
  respuesta?: { texto: string; fecha: string }
  utiles?: number
}

export type DiaSemana = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom'

export interface HorarioLaboral {
  dia: DiaSemana
  abierto: boolean
  desde?: string
  hasta?: string
}

export interface BloqueoCalendario {
  id: UUID
  usuarioId: UUID
  herramientaId?: UUID
  desde: string
  hasta: string
  motivo?: string
}

export interface MovimientoFinanciero {
  id: UUID
  usuarioId: UUID
  fecha: string
  tipo: 'ingreso' | 'retiro' | 'comision' | 'deposito_entrada' | 'deposito_liberado'
  monto: number
  contratacionId?: UUID
  descripcion: string
  estado: 'liquidado' | 'en_escrow' | 'procesando'
}

export interface MensajeChat {
  id: UUID
  conversacionId: UUID
  emisorId: UUID
  texto: string
  adjuntos?: { nombre: string; url: string }[]
  fecha: string
  leido: boolean
}

export interface Conversacion {
  id: UUID
  participantes: [UUID, UUID]
  contratacionId?: UUID
  ultimoMensaje?: string
  ultimoMensajeFecha?: string
  noLeidos: number
}

export interface MensajeChatbot {
  id: UUID
  rol: 'user' | 'bot'
  texto: string
  fecha: string
  componentes?: ChatbotBlock[]
}

export type ChatbotBlock =
  | { kind: 'chips'; preguntaId: string; opciones: { id: string; label: string }[] }
  | { kind: 'workers'; trabajadorIds: UUID[] }
  | { kind: 'tools'; herramientaIds: UUID[] }
  | {
      kind: 'cotizacion'
      items: {
        tipo: 'servicio' | 'arriendo' | 'materiales'
        label: string
        detalle?: string
        monto: number
        cantidad?: number
      }[]
      subtotal: number
      comision: number
      total: number
      titulo: string
    }

export interface ConversacionBot {
  id: UUID
  usuarioId?: UUID
  titulo: string
  creada: string
  mensajes: MensajeChatbot[]
}

export type TipoNotificacion =
  | 'nuevo_mensaje'
  | 'nueva_solicitud'
  | 'pago_liberado'
  | 'resena_recibida'
  | 'recordatorio'
  | 'cotizacion_lista'
  | 'escrow_pagado'
  | 'finalizada'

export interface Notificacion {
  id: UUID
  usuarioId: UUID
  tipo: TipoNotificacion
  titulo: string
  texto: string
  fecha: string
  leida: boolean
  link?: string
}

export interface Categoria {
  id: string
  nombre: string
  tipo: 'oficio' | 'herramienta'
  subcategorias?: string[]
  icono?: string
}

export interface Region {
  nombre: string
  comunas: string[]
}
