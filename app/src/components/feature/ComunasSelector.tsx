import { useMemo, useState } from 'react'
import { Search, X, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { regiones } from '@/mocks/regiones'
import { cn } from '@/lib/cn'

interface Props {
  value: string[]
  onChange: (comunas: string[]) => void
  /** Comuna sugerida por defecto (ej: la del perfil del usuario). */
  sugerida?: string
}

export function ComunasSelector({ value, onChange, sugerida }: Props) {
  const [query, setQuery] = useState('')
  const [openRegion, setOpenRegion] = useState<string | null>(null)

  const selected = useMemo(() => new Set(value), [value])
  const q = query.trim().toLowerCase()

  // Lista filtrada por búsqueda, agrupada por región
  const grupos = useMemo(() => {
    return regiones
      .map((r) => ({
        nombre: r.nombre,
        comunas: q
          ? r.comunas.filter((c) => c.toLowerCase().includes(q))
          : r.comunas,
      }))
      .filter((g) => g.comunas.length > 0)
  }, [q])

  // Si hay búsqueda, expande todas las regiones que matchean. Si no, solo la abierta manualmente.
  const showAll = q.length > 0

  function toggle(c: string) {
    if (selected.has(c)) onChange(value.filter((x) => x !== c))
    else onChange([...value, c])
  }

  function toggleRegionAll(regionName: string) {
    const region = regiones.find((r) => r.nombre === regionName)
    if (!region) return
    const todasIncluidas = region.comunas.every((c) => selected.has(c))
    if (todasIncluidas) {
      onChange(value.filter((c) => !region.comunas.includes(c)))
    } else {
      const set = new Set(value)
      region.comunas.forEach((c) => set.add(c))
      onChange(Array.from(set))
    }
  }

  function clearAll() {
    onChange([])
  }

  function quickAdd(c: string) {
    if (!selected.has(c)) onChange([...value, c])
  }

  // Sugerencias rápidas: comuna del perfil + algunas comunas comunes RM si no están ya
  const sugerencias = useMemo(() => {
    const base = [
      sugerida,
      'Santiago',
      'Providencia',
      'Las Condes',
      'Ñuñoa',
      'Maipú',
      'Puente Alto',
    ].filter((c): c is string => Boolean(c))
    // únicas + no ya seleccionadas
    return Array.from(new Set(base)).filter((c) => !selected.has(c)).slice(0, 6)
  }, [sugerida, selected])

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar comuna o región…"
          className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-navy"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-400 hover:bg-ink-100"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Seleccionadas */}
      {value.length > 0 ? (
        <div className="rounded-xl border border-navy/15 bg-cream-soft p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              {value.length} comuna{value.length === 1 ? '' : 's'} seleccionada{value.length === 1 ? '' : 's'}
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-rust hover:underline"
            >
              Quitar todas
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {value.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggle(c)}
                className="inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-xs font-semibold text-white hover:bg-rust"
                title="Quitar"
              >
                {c}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        sugerencias.length > 0 && (
          <div>
            <p className="text-xs text-ink-500 mb-2">Sugerencias rápidas:</p>
            <div className="flex flex-wrap gap-1.5">
              {sugerencias.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => quickAdd(c)}
                  className="chip"
                >
                  + {c}
                </button>
              ))}
            </div>
          </div>
        )
      )}

      {/* Lista por región */}
      <div className="rounded-xl border border-ink-200 bg-white max-h-96 overflow-y-auto">
        {grupos.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink-400">
            Sin resultados para "{query}".
          </p>
        ) : (
          grupos.map((g) => {
            const region = regiones.find((r) => r.nombre === g.nombre)!
            const todasIncluidas = region.comunas.every((c) => selected.has(c))
            const algunasIncluidas =
              !todasIncluidas && region.comunas.some((c) => selected.has(c))
            const isOpen = showAll || openRegion === g.nombre

            return (
              <div key={g.nombre} className="border-b border-ink-100 last:border-b-0">
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenRegion(openRegion === g.nombre ? null : g.nombre)
                    }
                    className="flex flex-1 items-center gap-2 text-left text-sm font-semibold"
                  >
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-ink-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-ink-400 shrink-0" />
                    )}
                    <span className="truncate">{g.nombre}</span>
                    <span className="text-xs font-normal text-ink-400">
                      ({g.comunas.length})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRegionAll(g.nombre)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition',
                      todasIncluidas
                        ? 'border-navy bg-navy text-white'
                        : algunasIncluidas
                          ? 'border-ember bg-ember/10 text-ember-600'
                          : 'border-ink-200 text-ink-500 hover:border-navy/30',
                    )}
                  >
                    {todasIncluidas ? (
                      <>
                        <Check className="h-3 w-3" /> Toda la región
                      </>
                    ) : (
                      'Toda la región'
                    )}
                  </button>
                </div>

                {isOpen && (
                  <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                    {g.comunas.map((c) => {
                      const active = selected.has(c)
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggle(c)}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition',
                            active
                              ? 'border-navy bg-navy text-white'
                              : 'border-ink-200 text-ink-600 hover:border-navy/30 hover:bg-ink-50',
                          )}
                        >
                          {active && <Check className="h-3 w-3" />}
                          {c}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
