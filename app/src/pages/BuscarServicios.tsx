import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, Search, X, CheckCircle2, Zap } from 'lucide-react'
import { servicios } from '@/mocks/servicios'
import { usersById } from '@/mocks/users'
import { oficios } from '@/mocks/categorias'
import { todasLasComunas } from '@/mocks/regiones'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { PriceTag } from '@/components/ui/PriceTag'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

type Orden = 'relevancia' | 'rating' | 'precio_asc' | 'precio_desc' | 'recientes'

export function BuscarServicios() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [cat, setCat] = useState(params.get('cat') ?? '')
  const [comuna, setComuna] = useState(params.get('comuna') ?? '')
  const [ratingMin, setRatingMin] = useState(0)
  const [soloVerificados, setSoloVerificados] = useState(false)
  const [disp, setDisp] = useState<'all' | 'inmediata' | 'agendada'>('all')
  const [orden, setOrden] = useState<Orden>('relevancia')
  const [drawer, setDrawer] = useState(false)

  function sync<T extends string>(key: string, value: T) {
    const p = new URLSearchParams(params)
    if (value) p.set(key, value)
    else p.delete(key)
    setParams(p, { replace: true })
  }

  const resultados = useMemo(() => {
    let items = servicios.slice()
    if (q) {
      const qq = q.toLowerCase()
      items = items.filter(
        (s) =>
          s.oficio.toLowerCase().includes(qq) ||
          s.descripcion.toLowerCase().includes(qq) ||
          s.categorias.some((c) => c.toLowerCase().includes(qq)),
      )
    }
    if (cat) items = items.filter((s) => s.oficio === cat)
    if (comuna) items = items.filter((s) => s.zonasCobertura.includes(comuna))
    if (ratingMin) items = items.filter((s) => s.calificacion >= ratingMin)
    if (soloVerificados) {
      items = items.filter((s) => {
        const u = usersById[s.trabajadorId]
        return u && u.verificacion.rut === 'validada' && u.verificacion.cedula === 'validada'
      })
    }
    if (disp !== 'all') items = items.filter((s) => s.disponibilidad === disp)

    if (orden === 'rating') items.sort((a, b) => b.calificacion - a.calificacion)
    if (orden === 'precio_asc')
      items.sort((a, b) => (a.tarifaReferencia.monto ?? 0) - (b.tarifaReferencia.monto ?? 0))
    if (orden === 'precio_desc')
      items.sort((a, b) => (b.tarifaReferencia.monto ?? 0) - (a.tarifaReferencia.monto ?? 0))
    if (orden === 'recientes') items.sort((a, b) => b.totalTrabajosRealizados - a.totalTrabajosRealizados)
    return items
  }, [q, cat, comuna, ratingMin, soloVerificados, disp, orden])

  function Filters() {
    return (
      <div className="space-y-5">
        <Select
          label="Oficio"
          value={cat}
          onChange={(e) => {
            setCat(e.target.value)
            sync('cat', e.target.value)
          }}
          placeholder="Todos"
          options={oficios.map((o) => ({ value: o.nombre, label: o.nombre }))}
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
          <p className="label-base">Calificación mínima</p>
          <div className="flex flex-wrap gap-2">
            {[0, 3, 4, 4.5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRatingMin(r)}
                className={
                  'chip ' + (ratingMin === r ? 'bg-navy text-cream border-navy' : 'hover:bg-cream-deep')
                }
              >
                {r === 0 ? 'Cualquiera' : `⭐ ${r}+`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="label-base">Disponibilidad</p>
          <div className="flex gap-2">
            {(['all', 'inmediata', 'agendada'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDisp(d)}
                className={
                  'chip ' + (disp === d ? 'bg-navy text-cream border-navy' : 'hover:bg-cream-deep')
                }
              >
                {d === 'all' ? 'Todas' : d === 'inmediata' ? 'Inmediata' : 'Agendable'}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={soloVerificados}
            onChange={(e) => setSoloVerificados(e.target.checked)}
            className="h-4 w-4 accent-navy"
          />
          Solo verificados
        </label>
      </div>
    )
  }

  return (
    <div className="container-page py-8 md:py-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ember">Oficios</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold">Busca al maestro indicado</h1>
          <p className="mt-2 text-ink-500 max-w-xl">
            {resultados.length} resultado{resultados.length === 1 ? '' : 's'} para tu búsqueda. Filtra por
            oficio, comuna o calificación.
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
              placeholder="gasfíter, eléctrico, pintor…"
              className="pl-9"
              wrapClassName="flex-1"
            />
          </div>
          <Button variant="outline" size="md" onClick={() => setDrawer(true)} className="md:hidden">
            <Filter className="h-4 w-4" /> Filtros
          </Button>
          <Select
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            options={[
              { value: 'relevancia', label: 'Relevancia' },
              { value: 'rating', label: 'Mejor calificados' },
              { value: 'precio_asc', label: 'Precio: menor' },
              { value: 'precio_desc', label: 'Precio: mayor' },
              { value: 'recientes', label: 'Más trabajos' },
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
            <EmptyState
              title="Sin resultados"
              description="Prueba ampliar tu búsqueda o pregúntale al asistente IA qué maestros podrían servir."
              action={
                <Link to="/asistente" className="btn-ember btn-md mt-3">
                  <Zap className="h-4 w-4" /> Preguntar al asistente
                </Link>
              }
            />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {resultados.map((s) => {
                const u = usersById[s.trabajadorId]
                return (
                  <li key={s.id}>
                    <Link to={`/servicio/${s.id}`} className="card group block p-0 overflow-hidden">
                      <div className="aspect-[4/3] overflow-hidden bg-cream-deep">
                        <img
                          src={s.galeriaTrabajos[0]}
                          alt={s.oficio}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <Avatar src={u?.fotoPerfil} name={u?.nombre} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">{u?.nombre} {u?.apellido}</p>
                            <p className="text-xs text-ink-400">
                              {s.oficio} · {s.experienciaAnios} años
                            </p>
                            <StarRating value={s.calificacion} count={s.totalTrabajosRealizados} size="sm" />
                          </div>
                        </div>
                        <p className="line-clamp-2 text-sm text-ink-500">{s.descripcion}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.certificaciones.slice(0, 2).map((c) => (
                            <span key={c.id} className="chip bg-moss/10 border-moss/20 text-moss text-[10px]">
                              <CheckCircle2 className="h-3 w-3" /> {c.nombre}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          {s.tarifaReferencia.monto ? (
                            <PriceTag value={s.tarifaReferencia.monto} unit={s.tarifaReferencia.tipo} size="sm" />
                          ) : (
                            <span className="font-mono text-xs text-ink-400">A convenir</span>
                          )}
                          <span className="chip bg-cream-soft">{u?.comuna}</span>
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
