import type { Categoria } from '@/types'

export const oficios: Categoria[] = [
  {
    id: 'of-gasfiter',
    nombre: 'Gasfíter',
    tipo: 'oficio',
    icono: 'droplet',
    subcategorias: ['Fontanería', 'Instalaciones sanitarias', 'Filtraciones', 'Calefont'],
  },
  {
    id: 'of-electrico',
    nombre: 'Eléctrico',
    tipo: 'oficio',
    icono: 'zap',
    subcategorias: ['Instalaciones', 'Emergencias', 'Tableros', 'Automatización'],
  },
  {
    id: 'of-maestro',
    nombre: 'Maestro de construcción',
    tipo: 'oficio',
    icono: 'hard-hat',
    subcategorias: ['Albañilería', 'Estuco', 'Hormigón', 'Obra gruesa'],
  },
  {
    id: 'of-pintor',
    nombre: 'Pintor',
    tipo: 'oficio',
    icono: 'paintbrush',
    subcategorias: ['Interior', 'Exterior', 'Esmalte', 'Empaste'],
  },
  {
    id: 'of-jardinero',
    nombre: 'Jardinero',
    tipo: 'oficio',
    icono: 'sprout',
    subcategorias: ['Mantención', 'Diseño paisajismo', 'Poda de árboles', 'Riego'],
  },
  {
    id: 'of-carpintero',
    nombre: 'Carpintero',
    tipo: 'oficio',
    icono: 'hammer',
    subcategorias: ['Mueblería a medida', 'Cubiertas', 'Puertas y ventanas'],
  },
  {
    id: 'of-cerrajero',
    nombre: 'Cerrajero',
    tipo: 'oficio',
    icono: 'key',
    subcategorias: ['Aperturas', 'Cambio de cerraduras', 'Blindadas'],
  },
  {
    id: 'of-tec-lineablanca',
    nombre: 'Técnico en línea blanca',
    tipo: 'oficio',
    icono: 'refrigerator',
    subcategorias: ['Lavadoras', 'Refrigeradores', 'Hornos', 'Estufas'],
  },
  {
    id: 'of-soldador',
    nombre: 'Soldador',
    tipo: 'oficio',
    icono: 'flame',
    subcategorias: ['Estructural', 'Rejas y portones', 'Mig/Tig'],
  },
  {
    id: 'of-climatizacion',
    nombre: 'Climatización / Refrigeración',
    tipo: 'oficio',
    icono: 'air-vent',
    subcategorias: ['Split', 'Centralizado', 'Mantención'],
  },
  {
    id: 'of-fletero',
    nombre: 'Fletero / Mudanzas',
    tipo: 'oficio',
    icono: 'truck',
    subcategorias: ['Mudanza residencial', 'Retiro de escombros', 'Fletes rurales'],
  },
  {
    id: 'of-tec-computadores',
    nombre: 'Técnico computacional',
    tipo: 'oficio',
    icono: 'monitor',
    subcategorias: ['Redes', 'Reparación', 'Mantenimiento'],
  },
]

export const categoriasHerramientas: Categoria[] = [
  {
    id: 'ht-electricas',
    nombre: 'Herramientas eléctricas',
    tipo: 'herramienta',
    icono: 'drill',
    subcategorias: ['Taladros', 'Amoladoras', 'Sierras', 'Esmeriles', 'Pistolas de impacto'],
  },
  {
    id: 'ht-manuales',
    nombre: 'Herramientas manuales',
    tipo: 'herramienta',
    icono: 'wrench',
    subcategorias: ['Llaves', 'Martillos', 'Niveles', 'Destornilladores'],
  },
  {
    id: 'ht-medicion',
    nombre: 'Equipos de medición',
    tipo: 'herramienta',
    icono: 'ruler',
    subcategorias: ['Niveles láser', 'Distanciómetros', 'Multímetros'],
  },
  {
    id: 'ht-maq-pesada',
    nombre: 'Maquinaria pesada',
    tipo: 'herramienta',
    icono: 'excavator',
    subcategorias: ['Retroexcavadora', 'Bobcat', 'Rodillo', 'Minicargador'],
  },
  {
    id: 'ht-escaleras',
    nombre: 'Escaleras y andamios',
    tipo: 'herramienta',
    icono: 'step-forward',
    subcategorias: ['Escaleras tijera', 'Andamios modulares', 'Escaleras telescópicas'],
  },
  {
    id: 'ht-generadores',
    nombre: 'Generadores y compresores',
    tipo: 'herramienta',
    icono: 'power',
    subcategorias: ['Generadores eléctricos', 'Compresores de aire', 'Soldadoras portátiles'],
  },
  {
    id: 'ht-hormigon',
    nombre: 'Equipos de hormigón',
    tipo: 'herramienta',
    icono: 'layers',
    subcategorias: ['Betoneras', 'Vibradores', 'Alisadoras'],
  },
  {
    id: 'ht-limpieza',
    nombre: 'Limpieza y jardinería',
    tipo: 'herramienta',
    icono: 'sparkles',
    subcategorias: ['Hidrolavadoras', 'Aspiradoras industriales', 'Motosierras', 'Desbrozadoras'],
  },
]

export const todasLasCategorias = [...oficios, ...categoriasHerramientas]
