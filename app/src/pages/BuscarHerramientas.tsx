import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, Search, Truck, X } from 'lucide-react'
import { herramientas } from '@/mocks/herramientas'
import { usersById } from '@/mocks/users'
import { categoriasHerramientas } from '@/mocks/categorias'
import { todasLasComunas } from '@/mocks/regiones'
import { StarRating } from '@/components/ui/StarRating'
import { PriceTag } from '@/components/ui/PriceTag'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'

export function BuscarHerramientas() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [cat, setCat] = useState(params.get('cat') ?? '')
  const [comuna, setComuna] = useState(params.get('comuna') ?? '')
  const [maxDia, setMaxDia] = useState<number>(0)
  const [soloEntrega, setSoloEntrega] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [orden, setOrden] = useState<'relevancia' | 'rating' | 'precio_asc' | 'precio_desc'>('relevancia')

  function sync(key: string, value: string) {
    const p = new URLSearchParams(params)
    if (value) p.set(key, value)
    else p.delete(key)
    setParams(p, { replace: true })
  }

  const resultados = useMemo(() => {
    let items = herramientas.slice()
    if (q) {
      const qq = q.toLowerCase()
      items = items.filter(
        (h) =>
          h.titulo.toLowerCase().includes(qq) ||
          h.marca.toLowerCase().includes(qq) ||
          h.descripcion.toLowerCase().includes(qq),
      )
    }
    if (cat) items = items.filter((h) => h.categoria === cat)
    if (comuna) items = items.filter((h) => h.comunaUbicacion === comuna)
    if (maxDia) items = items.filter((h) => (h.tarifa.porDia ?? Infinity) <= maxDia)
    if (soloEntrega) items = items.filter((h) => h.requiereEntrega || h.retiro === 'delivery' || h.retiro === 'ambos')

    if (orden === 'rating') items.sort((a, b) => b.calificacion - a.calificacion)
    if (orden === 'precio_asc') items.sort((a, b) => (a.tarifa.porDia ?? 0) - (b.tarifa.porDia ?? 0))
    if (orden === 'precio_desc') items.sort((a, b) => (b.tarifa.porDia ?? 0) - (a.tarifa.porDia ?? 0))
    return items
  }, [q, cat, comuna, maxDia, soloEntrega, orden])

  function Filters() {
    return (
      <div className="space-y-5">
        <Select
          label="Categoría"
          value={cat}
          onChange={(e) => {
            setCat(e.target.value)
            sync('cat', e.target.value)
          }}
          placeholder="Todas"
          options={categoriasHerramientas.map((c) => ({ value: c.nombre, label: c.nombre }))}
        />
        <Select
          label="Comuna"
          value={comuna}
          onChange={(e) => {
            setComuna(e.target.value)
            sync('comuna', e.target.value)
          }}
          placeholder="Toda la zona"
          options={todasLasComunas.map((c) => ({ value: c, label: c }))}
        />
        <div>
          <p className="label-base">Precio máximo por día</p>
          <div className="flex flex-wrap gap-2">
            {[
              { v: 0, l: 'Cualquiera' },
              { v: 20000, l: '< 20k' },
              { v: 50000, l: '< 50k' },
              { v: 100000, l: '< 100k' },
              { v: 300000, l: '< 300k' },
            ].map((p) => (
              <button
                key={p.v}
                type="button"
                onClick={() => setMaxDia(p.v)}
                className={
                  'chip ' + (maxDia === p.v ? 'bg-navy text-cream border-navy' : 'hover:bg-cream-deep')
                }
              >
                {p.l}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={soloEntrega} onChange={(e) => setSoloEntrega(e.target.checked)} className="h-4 w-4 accent-navy" />
          Solo con delivery
        </label>
      </div>
    )
  }

  return (
    <div className="container-page py-8 md:py-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ember">Herramientas</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold">Arriendo de equipos</h1>
          <p className="mt-2 text-ink-500">
            {resultados.length} equipo{resultados.length === 1 ? '' : 's'} disponibles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                sync('q', e.target.value)
              }}
              placeholder="retroexcavadora, taladro…"
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="md" onClick={() => setDrawer(true)} className="md:hidden">
            <Filter className="h-4 w-4" /> Filtros
          </Button>
          <Select
            value={orden}
            onChange={(e) => setOrden(e.target.value as typeof orden)}
            options={[
              { value: 'relevancia', label: 'Relevancia' },
              { value: 'rating', label: 'Mejor calificadas' },
              { value: 'precio_asc', label: 'Precio: menor' },
              { value: 'precio_desc', label: 'Precio: mayor' },
            ]}
            wrapClassName="hidden md:block"
          />
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[260px_1fr]">
        <aside className="hidden md:block sticky top-24 self-start">
          <div className="card p-5">
            <h3 className="font-display text-lg font-semibold mb-4">Filtros</h3>
            <Filters />
          </div>
        </aside>

        <section>
          {resultados.length === 0 ? (
            <EmptyState title="Sin equipos en esta búsqueda" description="Ajusta los filtros o prueba otra comuna." />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {resultados.map((h) => {
                const owner = usersById[h.propietarioId]
                return (
                  <li key={h.id}>
                    <Link to={`/herramienta/${h.id}`} className="card group block p-0 overflow-hidden">
                      <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
                        <img src={h.fotos[0]} alt={h.titulo} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                        {h.requiereEntrega && (
                          <span className="absolute left-3 top-3 chip-solid bg-moss text-cream">
                            <Truck className="h-3 w-3" /> Delivery
                          </span>
                        )}
                        <span className="absolute right-3 top-3 chip-solid bg-navy/90">{h.estado}</span>
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="font-mono text-[10px] uppercase text-ink-400">{h.categoria}</p>
                        <h3 className="font-display text-lg font-semibold leading-tight">{h.titulo}</h3>
                        <p className="text-xs text-ink-500">
                          {h.marca} · {h.modelo}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <PriceTag value={h.tarifa.porDia} unit="día" size="sm" />
                          <StarRating value={h.calificacion} size="sm" />
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-navy/10">
                          <div className="flex items-center gap-2">
                            <Avatar src={owner?.fotoPerfil} name={owner?.nombre} size="xs" />
                            <span className="text-xs text-ink-500">{owner?.nombre}</span>
                          </div>
                          <span className="chip">{h.comunaUbicacion}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setDrawer(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t-2 border-navy bg-paper p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">Filtros</h3>
              <button onClick={() => setDrawer(false)} className="rounded-full p-1 hover:bg-navy/5">
                <X className="h-5 w-5" />
              </button>
            </div>
            <Filters />
            <Button variant="primary" size="lg" className="mt-5 w-full" onClick={() => setDrawer(false)}>
              Aplicar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
