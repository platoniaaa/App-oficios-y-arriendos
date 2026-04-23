import type { ChatbotBlock } from '@/types'
import { fees } from '@/config/brand'

export interface Intent {
  id: string
  keywords: string[]
  titulo: string
  pasos: Paso[]
}

export interface Paso {
  id: string
  bot: string
  bloque?: ChatbotBlock
  siguiente?: string | ((respuesta: string) => string)
}

type Cotizacion = Extract<ChatbotBlock, { kind: 'cotizacion' }>

function cotizar(items: Cotizacion['items'], titulo: string): Cotizacion {
  const subtotal = items.reduce((s, i) => s + i.monto * (i.cantidad ?? 1), 0)
  const comision = Math.round(subtotal * fees.comisionPlataforma)
  const total = subtotal + comision
  return { kind: 'cotizacion', items, subtotal, comision, total, titulo }
}

export const intents: Intent[] = [
  {
    id: 'remodel-bano',
    keywords: ['baño', 'remodelar baño', 'bano', 'renovar baño', 'remodelacion baño'],
    titulo: 'Remodelación de baño',
    pasos: [
      {
        id: 'p1',
        bot: 'Perfecto, vamos a remodelar un baño. ¿Qué dimensiones tiene aproximadamente?',
        bloque: {
          kind: 'chips',
          preguntaId: 'tamano',
          opciones: [
            { id: 'chico', label: 'Pequeño (< 3 m²)' },
            { id: 'medio', label: 'Mediano (3–5 m²)' },
            { id: 'grande', label: 'Grande (> 5 m²)' },
          ],
        },
        siguiente: 'p2',
      },
      {
        id: 'p2',
        bot: '¿Qué quieres cambiar?',
        bloque: {
          kind: 'chips',
          preguntaId: 'alcance',
          opciones: [
            { id: 'completo', label: 'Todo (cerámica, WC, lavamanos, ducha)' },
            { id: 'parcial', label: 'Solo artefactos' },
            { id: 'pintura', label: 'Solo pintura y detalles' },
          ],
        },
        siguiente: 'p3',
      },
      {
        id: 'p3',
        bot: 'Tengo los maestros indicados cerca tuyo. Estos son los mejor calificados:',
        bloque: { kind: 'workers', trabajadorIds: ['u-15', 'u-demo-trabajador', 'u-04'] },
        siguiente: 'p4',
      },
      {
        id: 'p4',
        bot: 'También necesitarás algunas herramientas clave. ¿Quieres arrendarlas?',
        bloque: { kind: 'tools', herramientaIds: ['h-03', 'h-02', 'h-04'] },
        siguiente: 'p5',
      },
      {
        id: 'p5',
        bot: 'Esta es una estimación inicial según tu proyecto:',
        bloque: cotizar(
          [
            { tipo: 'servicio', label: 'Maestro construcción (5 días)', detalle: 'Demolición + obra', monto: 220000, cantidad: 5 },
            { tipo: 'servicio', label: 'Gasfíter (visita + ajustes)', monto: 60000, cantidad: 2 },
            { tipo: 'servicio', label: 'Eléctrico (instalaciones)', monto: 80000, cantidad: 1 },
            { tipo: 'arriendo', label: 'Amoladora y taladro percutor (5 días)', monto: 27000, cantidad: 5 },
            { tipo: 'materiales', label: 'Materiales estimados', detalle: 'Cerámica, artefactos, fragüe', monto: 650000, cantidad: 1 },
          ],
          'Remodelación baño mediano',
        ),
      },
    ],
  },
  {
    id: 'construir-terraza',
    keywords: ['terraza', 'construir terraza', 'deck', 'quincho'],
    titulo: 'Construcción de terraza',
    pasos: [
      {
        id: 'p1',
        bot: '¡Una terraza! 🌿 ¿Cuántos metros cuadrados aprox.?',
        bloque: {
          kind: 'chips',
          preguntaId: 'tamano',
          opciones: [
            { id: '10', label: '10 m²' },
            { id: '20', label: '20 m²' },
            { id: '30', label: '30 m²' },
          ],
        },
        siguiente: 'p2',
      },
      {
        id: 'p2',
        bot: '¿Qué materialidad prefieres?',
        bloque: {
          kind: 'chips',
          preguntaId: 'material',
          opciones: [
            { id: 'deck', label: 'Deck de madera' },
            { id: 'porcelanato', label: 'Porcelanato' },
            { id: 'hormigon', label: 'Hormigón pulido' },
          ],
        },
        siguiente: 'p3',
      },
      {
        id: 'p3',
        bot: 'Estos maestros pueden ayudarte con la obra:',
        bloque: { kind: 'workers', trabajadorIds: ['u-15', 'u-06', 'u-18'] },
        siguiente: 'p4',
      },
      {
        id: 'p4',
        bot: 'Y necesitarás estos equipos:',
        bloque: { kind: 'tools', herramientaIds: ['h-11', 'h-08', 'h-04'] },
        siguiente: 'p5',
      },
      {
        id: 'p5',
        bot: 'Estimación inicial:',
        bloque: cotizar(
          [
            { tipo: 'servicio', label: 'Maestro construcción (7 días)', monto: 220000, cantidad: 7 },
            { tipo: 'servicio', label: 'Ayudante (7 días)', monto: 90000, cantidad: 7 },
            { tipo: 'arriendo', label: 'Betonera + andamio (5 días)', monto: 46000, cantidad: 5 },
            { tipo: 'materiales', label: 'Hormigón, fierro, deck', monto: 1200000, cantidad: 1 },
          ],
          'Terraza 20 m² con deck',
        ),
      },
    ],
  },
  {
    id: 'fuga-agua',
    keywords: ['fuga', 'agua', 'filtración', 'gotea', 'filtracion'],
    titulo: 'Reparación de fuga de agua',
    pasos: [
      {
        id: 'p1',
        bot: 'Entiendo, una fuga necesita atención rápida. ¿Dónde ocurre?',
        bloque: {
          kind: 'chips',
          preguntaId: 'donde',
          opciones: [
            { id: 'bano', label: 'Baño' },
            { id: 'cocina', label: 'Cocina' },
            { id: 'pared', label: 'En la pared' },
            { id: 'medidor', label: 'En el medidor' },
          ],
        },
        siguiente: 'p2',
      },
      {
        id: 'p2',
        bot: '¿Cortaste el agua? Si es urgente puedo agendar una visita hoy mismo.',
        bloque: {
          kind: 'chips',
          preguntaId: 'urgencia',
          opciones: [
            { id: 'hoy', label: 'Hoy mismo' },
            { id: 'manana', label: 'Mañana' },
            { id: 'semana', label: 'Esta semana' },
          ],
        },
        siguiente: 'p3',
      },
      {
        id: 'p3',
        bot: 'Estos gasfíter están disponibles y tienen gran reputación:',
        bloque: { kind: 'workers', trabajadorIds: ['u-demo-trabajador'] },
        siguiente: 'p4',
      },
      {
        id: 'p4',
        bot: 'Estimación para una visita de diagnóstico + reparación típica:',
        bloque: cotizar(
          [
            { tipo: 'servicio', label: 'Visita diagnóstico', monto: 35000, cantidad: 1 },
            { tipo: 'servicio', label: 'Reparación + materiales menores', monto: 40000, cantidad: 1 },
          ],
          'Reparación de fuga',
        ),
      },
    ],
  },
  {
    id: 'mudanza',
    keywords: ['mudanza', 'flete', 'trasladar', 'cambiarme de casa'],
    titulo: 'Mudanza residencial',
    pasos: [
      {
        id: 'p1',
        bot: '¡Vamos con la mudanza! ¿Cuántos dormitorios tiene la casa/depto?',
        bloque: {
          kind: 'chips',
          preguntaId: 'dormitorios',
          opciones: [
            { id: '1', label: '1' },
            { id: '2', label: '2' },
            { id: '3', label: '3' },
            { id: '4', label: '4+' },
          ],
        },
        siguiente: 'p2',
      },
      {
        id: 'p2',
        bot: '¿Necesitas ayuda con los muebles grandes o solo transporte?',
        bloque: {
          kind: 'chips',
          preguntaId: 'alcance',
          opciones: [
            { id: 'desarmar', label: 'Desarmar y armar muebles' },
            { id: 'solo-cargar', label: 'Solo cargar/descargar' },
            { id: 'todo', label: 'Servicio completo' },
          ],
        },
        siguiente: 'p3',
      },
      {
        id: 'p3',
        bot: 'Nuestro fletero recomendado:',
        bloque: { kind: 'workers', trabajadorIds: ['u-13'] },
        siguiente: 'p4',
      },
      {
        id: 'p4',
        bot: 'Y un carro para cosas delicadas:',
        bloque: { kind: 'tools', herramientaIds: ['h-14'] },
        siguiente: 'p5',
      },
      {
        id: 'p5',
        bot: 'Estimación de la mudanza:',
        bloque: cotizar(
          [
            { tipo: 'servicio', label: 'Flete 3/4 cerrada (4h)', monto: 60000, cantidad: 1 },
            { tipo: 'servicio', label: 'Ayudante adicional', monto: 25000, cantidad: 1 },
            { tipo: 'arriendo', label: 'Escalera para muebles altos', monto: 8000, cantidad: 1 },
          ],
          'Mudanza depto 2 dormitorios',
        ),
      },
    ],
  },
  {
    id: 'instalacion-electrica',
    keywords: ['eléctrica', 'electrica', 'ampliación', 'ampliacion', 'tablero', 'enchufes'],
    titulo: 'Instalación eléctrica para ampliación',
    pasos: [
      {
        id: 'p1',
        bot: '¿Qué necesitas agregar a la instalación eléctrica?',
        bloque: {
          kind: 'chips',
          preguntaId: 'alcance',
          opciones: [
            { id: 'tablero', label: 'Cambio de tablero' },
            { id: 'circuito', label: 'Circuitos nuevos' },
            { id: 'iluminacion', label: 'Iluminación LED' },
          ],
        },
        siguiente: 'p2',
      },
      {
        id: 'p2',
        bot: '¿Cuántos puntos aprox. necesitas?',
        bloque: {
          kind: 'chips',
          preguntaId: 'puntos',
          opciones: [
            { id: '1-3', label: '1 a 3 puntos' },
            { id: '4-8', label: '4 a 8 puntos' },
            { id: '9+', label: 'Más de 9' },
          ],
        },
        siguiente: 'p3',
      },
      {
        id: 'p3',
        bot: 'Te recomiendo a estos eléctricos certificados SEC:',
        bloque: { kind: 'workers', trabajadorIds: ['u-04'] },
        siguiente: 'p4',
      },
      {
        id: 'p4',
        bot: 'Para trabajar seguro conviene tener estas herramientas:',
        bloque: { kind: 'tools', herramientaIds: ['h-07', 'h-13'] },
        siguiente: 'p5',
      },
      {
        id: 'p5',
        bot: 'Estimación:',
        bloque: cotizar(
          [
            { tipo: 'servicio', label: 'Eléctrico clase A (jornada)', monto: 180000, cantidad: 1 },
            { tipo: 'materiales', label: 'Materiales (cables, tableros, protecciones)', monto: 180000, cantidad: 1 },
          ],
          'Instalación eléctrica ampliación',
        ),
      },
    ],
  },
]

export function matchIntent(texto: string): Intent | null {
  const t = texto.toLowerCase()
  for (const i of intents) {
    if (i.keywords.some((k) => t.includes(k))) return i
  }
  return null
}
