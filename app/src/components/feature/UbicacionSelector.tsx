import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import { useUbicacion } from '@/stores/useUbicacion'
import { regiones } from '@/mocks/regiones'
import { cn } from '@/lib/cn'

export function UbicacionSelector() {
  const comuna = useUbicacion((s) => s.comuna)
  const setComuna = useUbicacion((s) => s.setComuna)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', onClick)
      document.addEventListener('keydown', onEsc)
    }
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const qq = q.trim().toLowerCase()

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-ink-500 transition hover:bg-navy/5 hover:text-navy"
      >
        <MapPin className="h-3.5 w-3.5" />
        <span className="hidden xs:inline">{comuna ? <strong className="text-navy">{comuna}</strong> : 'Elige tu comuna'}</span>
        <span className="xs:hidden">{comuna ?? 'Comuna'}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border-2 border-navy bg-paper shadow-ticket">
          <div className="border-b border-navy/10 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar comuna…"
                autoFocus
                className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm text-navy placeholder:text-ink-400 focus:border-navy focus:outline-none"
              />
            </div>
            {comuna && (
              <button
                type="button"
                onClick={() => {
                  setComuna(null)
                  setOpen(false)
                }}
                className="mt-2 inline-flex items-center gap-1 text-xs text-ink-500 hover:text-navy"
              >
                <X className="h-3 w-3" /> Quitar comuna
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {regiones.map((r) => {
              const comunasFiltradas = qq
                ? r.comunas.filter((c) => c.toLowerCase().includes(qq))
                : r.comunas
              if (comunasFiltradas.length === 0) return null
              return (
                <div key={r.nombre} className="mb-2">
                  <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-400">
                    {r.nombre}
                  </p>
                  <ul>
                    {comunasFiltradas.map((c) => (
                      <li key={c}>
                        <button
                          type="button"
                          onClick={() => {
                            setComuna(c)
                            setOpen(false)
                          }}
                          className={cn(
                            'block w-full rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-cream-soft',
                            comuna === c && 'bg-cream-soft font-semibold text-navy',
                          )}
                        >
                          {c}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
