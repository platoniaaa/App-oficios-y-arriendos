import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  imagenes: string[]
  cols?: number
}

export function GaleriaLightbox({ imagenes, cols = 3 }: Props) {
  const [idx, setIdx] = useState<number | null>(null)
  const gridCls =
    cols === 4
      ? 'grid-cols-2 md:grid-cols-4'
      : cols === 2
        ? 'grid-cols-2'
        : 'grid-cols-2 sm:grid-cols-3'

  return (
    <>
      <div className={`grid gap-3 ${gridCls}`}>
        {imagenes.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-ink-200 bg-ink-100"
          >
            <img
              src={src}
              alt={`Imagen ${i + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          </button>
        ))}
      </div>
      {idx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4">
          <button
            className="absolute right-4 top-4 rounded-full bg-white p-2 text-navy hover:bg-ink-100"
            onClick={() => setIdx(null)}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            className="absolute left-4 rounded-full bg-white p-2 text-navy hover:bg-ink-100"
            onClick={() => setIdx((v) => (v === null ? null : (v - 1 + imagenes.length) % imagenes.length))}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="absolute right-16 top-4 rounded-full bg-white p-2 text-navy hover:bg-ink-100 md:right-4 md:top-1/2 md:-translate-y-1/2"
            onClick={() => setIdx((v) => (v === null ? null : (v + 1) % imagenes.length))}
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <img
            src={imagenes[idx]}
            alt=""
            className="max-h-[90vh] max-w-full rounded-2xl border-2 border-white object-contain"
          />
        </div>
      )}
    </>
  )
}
