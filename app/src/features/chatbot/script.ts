import type { ChatbotBlock } from '@/types'
import { fees } from '@/config/brand'

export type AudienciaIntent = 'particular' | 'profesional' | 'ambos'

export interface Intent {
  id: string
  keywords: string[]
  titulo: string
  pasos: Paso[]
  audiencia: AudienciaIntent
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
    audiencia: 'ambos',
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
    audiencia: 'profesional',
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
    audiencia: 'particular',
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
    audiencia: 'particular',
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
    audiencia: 'ambos',
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
  {
    id: 'obra-completa',
    keywords: ['obra', 'ampliación', 'ampliacion', 'cuadrilla completa', 'proyecto', 'cotizar obra', 'subcontratar'],
    titulo: 'Cotizar obra completa',
    audiencia: 'profesional',
    pasos: [
      {
        id: 'p1',
        bot: 'Vamos a armar tu obra. ¿Qué tipo de proyecto estás gestionando?',
        bloque: {
          kind: 'chips',
          preguntaId: 'tipo',
          opciones: [
            { id: 'amp', label: 'Ampliación residencial' },
            { id: 'remodel', label: 'Remodelación integral' },
            { id: 'nueva', label: 'Construcción nueva' },
            { id: 'comercial', label: 'Local comercial' },
          ],
        },
        siguiente: 'p2',
      },
      {
        id: 'p2',
        bot: '¿Cuántos metros cuadrados aproximados?',
        bloque: {
          kind: 'chips',
          preguntaId: 'm2',
          opciones: [
            { id: '50', label: 'Hasta 50 m²' },
            { id: '100', label: '50-100 m²' },
            { id: '200', label: '100-200 m²' },
            { id: '+200', label: 'Más de 200 m²' },
          ],
        },
        siguiente: 'p3',
      },
      {
        id: 'p3',
        bot: '¿Qué especialidades necesitas? Marca todas las que apliquen.',
        bloque: {
          kind: 'chips',
          preguntaId: 'especialidades',
          opciones: [
            { id: 'gruesa', label: 'Obra gruesa' },
            { id: 'electrico', label: 'Eléctrico' },
            { id: 'gasfit', label: 'Gasfitería' },
            { id: 'termin', label: 'Terminaciones' },
          ],
        },
        siguiente: 'p4',
      },
      {
        id: 'p4',
        bot: 'Estas son las cuadrillas con disponibilidad para tu zona y plazo:',
        bloque: { kind: 'workers', trabajadorIds: ['u-15', 'u-04', 'u-demo-trabajador', 'u-08'] },
        siguiente: 'p5',
      },
      {
        id: 'p5',
        bot: 'Y los equipos que necesitarás:',
        bloque: { kind: 'tools', herramientaIds: ['h-01', 'h-05', 'h-08', 'h-11'] },
        siguiente: 'p6',
      },
      {
        id: 'p6',
        bot: 'Cotización inicial por tu obra, lista para revisar:',
        bloque: cotizar(
          [
            { tipo: 'servicio', label: 'Maestro construcción + cuadrilla (15 días)', detalle: '1 maestro + 2 ayudantes', monto: 380000, cantidad: 15 },
            { tipo: 'servicio', label: 'Eléctrico clase A (jornadas completas)', monto: 180000, cantidad: 4 },
            { tipo: 'servicio', label: 'Gasfíter (instalaciones)', monto: 95000, cantidad: 5 },
            { tipo: 'arriendo', label: 'Retroexcavadora 4 días + Bobcat 3 días', monto: 280000, cantidad: 7 },
            { tipo: 'arriendo', label: 'Andamios + betonera (15 días)', monto: 46000, cantidad: 15 },
            { tipo: 'materiales', label: 'Materiales estimados (rango referencial)', detalle: 'Hormigón, fierro, terminaciones', monto: 4500000, cantidad: 1 },
          ],
          'Ampliación residencial 100 m²',
        ),
      },
    ],
  },
  {
    id: 'subcontratar-cuadrilla',
    keywords: ['subcontratar', 'cuadrilla', 'maestros', 'cuadrillas para mi obra', 'mas gente'],
    titulo: 'Subcontratar cuadrilla extra',
    audiencia: 'profesional',
    pasos: [
      {
        id: 'p1',
        bot: 'Necesitas refuerzo. ¿Para cuándo y cuántos días?',
        bloque: {
          kind: 'chips',
          preguntaId: 'duracion',
          opciones: [
            { id: 'urg', label: 'Urgente (esta semana)' },
            { id: '7d', label: '1 semana' },
            { id: '14d', label: '2 semanas' },
            { id: '30d', label: '1 mes o más' },
          ],
        },
        siguiente: 'p2',
      },
      {
        id: 'p2',
        bot: '¿Qué especialidad necesitas?',
        bloque: {
          kind: 'chips',
          preguntaId: 'esp',
          opciones: [
            { id: 'maestro', label: 'Maestros de construcción' },
            { id: 'pintor', label: 'Pintores' },
            { id: 'soldador', label: 'Soldadores' },
            { id: 'mixto', label: 'Cuadrilla mixta' },
          ],
        },
        siguiente: 'p3',
      },
      {
        id: 'p3',
        bot: 'Maestros disponibles que ya han trabajado en obras similares:',
        bloque: { kind: 'workers', trabajadorIds: ['u-15', 'u-08', 'u-18', 'u-05'] },
        siguiente: 'p4',
      },
      {
        id: 'p4',
        bot: 'Cotización referencial por una cuadrilla de 3 personas durante 1 semana:',
        bloque: cotizar(
          [
            { tipo: 'servicio', label: 'Maestro construcción (5 días)', monto: 220000, cantidad: 5 },
            { tipo: 'servicio', label: 'Ayudante 1 (5 días)', monto: 90000, cantidad: 5 },
            { tipo: 'servicio', label: 'Ayudante 2 (5 días)', monto: 90000, cantidad: 5 },
          ],
          'Cuadrilla extra · 5 días',
        ),
      },
    ],
  },
]

export function intentsParaModo(modo: 'particular' | 'profesional' | null): Intent[] {
  if (!modo) return intents
  return intents.filter((i) => i.audiencia === 'ambos' || i.audiencia === modo)
}

export function matchIntent(texto: string): Intent | null {
  const t = texto.toLowerCase()
  for (const i of intents) {
    if (i.keywords.some((k) => t.includes(k))) return i
  }
  return null
}
