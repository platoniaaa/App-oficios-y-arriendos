import type { Region } from '@/types'

export const regiones: Region[] = [
  {
    nombre: 'Metropolitana',
    comunas: [
      'Santiago',
      'Providencia',
      'Ñuñoa',
      'Las Condes',
      'Maipú',
      'La Florida',
      'Puente Alto',
      'Peñalolén',
      'San Bernardo',
      'Quilicura',
      'Vitacura',
      'Lo Barnechea',
      'Recoleta',
      'Independencia',
      'Macul',
      'La Reina',
      'Huechuraba',
      'Pudahuel',
      'Cerrillos',
      'Renca',
    ],
  },
  {
    nombre: 'Valparaíso',
    comunas: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Concón', 'San Antonio'],
  },
  {
    nombre: 'Biobío',
    comunas: ['Concepción', 'Talcahuano', 'Chiguayante', 'San Pedro de la Paz', 'Coronel'],
  },
  {
    nombre: 'Los Lagos',
    comunas: ['Puerto Montt', 'Puerto Varas', 'Osorno', 'Castro'],
  },
  {
    nombre: 'Antofagasta',
    comunas: ['Antofagasta', 'Calama', 'Mejillones'],
  },
  {
    nombre: "O'Higgins",
    comunas: ['Rancagua', 'Machalí', 'San Fernando'],
  },
]

export const todasLasComunas = regiones.flatMap((r) => r.comunas)
