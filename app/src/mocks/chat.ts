import type { Conversacion, MensajeChat } from '@/types'

export const conversacionesSeed: Conversacion[] = [
  {
    id: 'conv-1',
    participantes: ['u-demo-cliente', 'u-04'],
    contratacionId: 'co-1001',
    ultimoMensaje: 'Perfecto, mañana a las 10.30 am entonces.',
    ultimoMensajeFecha: '2026-04-18T11:20:00',
    noLeidos: 0,
  },
  {
    id: 'conv-2',
    participantes: ['u-demo-cliente', 'u-12'],
    contratacionId: 'co-1002',
    ultimoMensaje: 'Ya dejaste el nivel en bodega? Paso mañana a buscarlo.',
    ultimoMensajeFecha: '2026-04-18T09:10:00',
    noLeidos: 1,
  },
  {
    id: 'conv-3',
    participantes: ['u-demo-cliente', 'u-07'],
    ultimoMensaje: 'Te envío la cotización apenas vuelva a la oficina.',
    ultimoMensajeFecha: '2026-04-17T16:45:00',
    noLeidos: 0,
  },
  {
    id: 'conv-4',
    participantes: ['u-demo-trabajador', 'u-19'],
    contratacionId: 'co-1003',
    ultimoMensaje: 'Dejé todo probado y funcionando, espero tu aprobación 🙌',
    ultimoMensajeFecha: '2026-04-16T18:30:00',
    noLeidos: 0,
  },
]

export const mensajesSeed: MensajeChat[] = [
  {
    id: 'm-1',
    conversacionId: 'conv-1',
    emisorId: 'u-04',
    texto: 'Hola Fernanda 👋 Recibí tu solicitud, mañana paso a cotizar en terreno.',
    fecha: '2026-04-14T10:00:00',
    leido: true,
  },
  {
    id: 'm-2',
    conversacionId: 'conv-1',
    emisorId: 'u-demo-cliente',
    texto: '¡Gracias Ignacio! ¿A qué hora te acomoda?',
    fecha: '2026-04-14T10:04:00',
    leido: true,
  },
  {
    id: 'm-3',
    conversacionId: 'conv-1',
    emisorId: 'u-04',
    texto: 'Entre 10 y 11 am si te parece.',
    fecha: '2026-04-14T10:10:00',
    leido: true,
  },
  {
    id: 'm-4',
    conversacionId: 'conv-1',
    emisorId: 'u-demo-cliente',
    texto: 'Perfecto, mañana a las 10.30 am entonces.',
    fecha: '2026-04-18T11:20:00',
    leido: true,
  },
  {
    id: 'm-5',
    conversacionId: 'conv-2',
    emisorId: 'u-12',
    texto: 'Buenos días, el nivel está listo para retiro cuando pase a buscarlo.',
    fecha: '2026-04-18T09:00:00',
    leido: true,
  },
  {
    id: 'm-6',
    conversacionId: 'conv-2',
    emisorId: 'u-12',
    texto: 'Ya dejaste el nivel en bodega? Paso mañana a buscarlo.',
    fecha: '2026-04-18T09:10:00',
    leido: false,
  },
]
