import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, Search, X, Truck, Hammer, Wrench, CheckCircle2, Zap } from 'lucide-react'
import { oficios, categoriasHerramientas } from '@/mocks/categorias'
import { todasLasComunas } from '@/mocks/regiones'
import type { ServicioOficio, Herramienta, User } from '@/types'
import { listServicios } from '@/lib/queries/servicios'
import { listHerramientas } from '@/lib/queries/herramientas'
import { getProfilesByIds } from '@/lib/queries/perfiles'
import { useFetch } from '@/hooks/useFetch'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { PriceTag } from '@/components/ui/PriceTag'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'

type TipoFiltro = 'todos' | 'servicios' | 'herramientas'
type Orden = 'relevancia' | 'rating' | 'precio_asc' | 'precio_desc' | 'recientes'

interface ItemServicio {
  kind: 'servicio'
  data: ServicioOficio
  user: User | undefined
  precioRef: number | undefined
  comuna: string
  rating: number
  categoria: string
  pop: number
}
interface ItemHerramienta {
  kind: 'herramienta'
  data: Herramienta
  user: User | undefined
  precioRef: number | undefined
  comuna: string
  rating: number
  categoria: string
  pop: number
}
type Item = ItemServicio | ItemHerramienta

export function Buscar() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [tipo, setTipo] = useState<TipoFiltro>((params.get('tipo') as TipoFiltro) ?? 'todos')
  const [cat, setCat] = useState(params.get('cat') ?? '')
  const [comuna, setComuna] = useState(params.get('comuna') ?? '')
  const [ratingMin, setRatingMin] = useState(0)
  const [soloVerificados, setSoloVerificados] = useState(false)
  const [maxPrecio, setMaxPrecio] = useState(0)
  const [orden, setOrden] = useState<Orden>('relevancia')
  const [drawer, setDrawer] = useState(false)

  function sync(key: string, value: string) {
    const p = new URLSearchParams(params)
    if (value) p.set(key, value)
    else p.delete(key)
    setParams(p, { replace: true })
  }

  const { data: dataset, loading } = useFetch(async () => {
    const [servicios, herramientas] = await Promise.all([listServicios(), listHerramientas()])
    const ids = [
      ...servicios.map((s) => s.trabajadorId),
      ...herramientas.map((h) => h.propietarioId),
    ]
    const usersById = await getProfilesByIds(ids)
    return { servicios, herramientas, usersById }
  }, [])

  const servicios: ServicioOficio[] = dataset?.servicios ?? []
  const herramientas: Herramienta[] = dataset?.herramientas ?? []
  const usersById: Record<string, User> = dataset?.usersById ?? {}

  const items: Item[] = useMemo(() => {
    const sItems: ItemServicio[] = servicios.map((s) => ({
      kind: 'servicio',
      data: s,
      user: usersById[s.trabajadorId],
      precioRef: s.tarifaReferencia.monto,
      comuna: usersById[s.trabajadorId]?.comuna ?? '',
      rating: s.calificacion,
      categoria: s.oficio,
      pop: s.totalTrabajosRealizados,
    }))
    const hItems: ItemHerramienta[] = herramientas.map((h) => ({
      kind: 'herramienta',
      data: h,
      user: usersById[h.propietarioId],
      precioRef: h.tarifa.porDia,
      comuna: h.comunaUbicacion,
      rating: h.calificacion,
      categoria: h.categoria,
      pop: h.totalArriendos,
    }))
    return [...sItems, ...hItems]
  }, [servicios, herramientas, usersById])

  const resultados = useMemo(() => {
    let lista = items.slice()

    if (tipo === 'servicios') lista = lista.filter((i) => i.kind === 'servicio')
    if (tipo === 'herramientas') lista = lista.filter((i) => i.kind === 'herramienta')

    if (q) {
      const qq = q.toLowerCase()
      lista = lista.filter((i) => {
        if (i.kind === 'servicio') {
          return (
            i.data.oficio.toLowerCase().includes(qq) ||
            i.data.descripcion.toLowerCase().includes(qq) ||
            i.data.categorias.some((c) => c.toLowerCase().includes(qq))
          )
        }
        return (
          i.data.titulo.toLowerCase().includes(qq) ||
          i.data.marca.toLowerCase().includes(qq) ||
          i.data.descripcion.toLowerCase().includes(qq) ||
          i.data.categoria.toLowerCase().includes(qq)
        )
      })
    }

    if (cat) lista = lista.filter((i) => i.categoria === cat)
    if (comuna)
      lista = lista.filter((i) => {
        if (i.kind === 'servicio') return i.data.zonasCobertura.includes(comuna)
        return i.comuna === comuna
      })
    if (ratingMin) lista = lista.filter((i) => i.rating >= ratingMin)
    if (maxPrecio) lista = lista.filter((i) => (i.precioRef ?? Infinity) <= maxPrecio)
    if (soloVerificados)
      lista = lista.filter((i) => i.user?.verificacion.rut === 'validada' && i.user?.verificacion.cedula === 'validada')

    if (orden === 'rating') lista.sort((a, b) => b.rating - a.rating)
    if (orden === 'precio_asc') lista.sort((a, b) => (a.precioRef ?? 0) - (b.precioRef ?? 0))
    if (orden === 'precio_desc') lista.sort((a, b) => (b.precioRef ?? 0) - (a.precioRef ?? 0))
    if (orden === 'recientes') lista.sort((a, b) => b.pop - a.pop)
    return lista
  }, [items, q, tipo, cat, comuna, ratingMin, maxPrecio, soloVerificados, orden])

  const conteoServicios = items.filter((i) => i.kind === 'servicio').length
  const conteoHerramientas = items.filter((i) => i.kind === 'herramienta').length

  const opcionesCategorias = [
    ...oficios.map((o) => ({ value: o.nombre, label: `${o.nombre} (oficio)` })),
    ...categoriasHerramientas.map((c) => ({ value: c.nombre, label: `${c.nombre} (equipo)` })),
  ]

  function Filters() {
    return (
      <div className="space-y-5">
        <div>
          <p className="label-base">Tipo</p>
          <div className="inline-flex w-full rounded-full border border-ink-200 bg-white p-0.5">
            {(['todos', 'servicios', 'herramientas'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTipo(t)
                  sync('tipo', t === 'todos' ? '' : t)
                }}
                className={cn(
                  'flex-1 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition',
                  tipo === t ? 'bg-navy text-white' : 'text-ink-500 hover:text-navy',
                )}
              >
                {t === 'todos' ? `Todos (${items.length})` : t === 'servicios' ? `Oficios (${conteoServicios})` : `Equipos (${conteoHerramientas})`}
              </button>
            ))}
          </div>
        </div>

        <Select
          label="Categoría"
          value={cat}
          onChange={(e) => {
            setCat(e.target.value)
            sync('cat', e.target.value)
          }}
          placeholder="Todas"
          options={opcionesCategorias}
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
                className={'chip ' + (ratingMin === r ? 'bg-navy text-cream border-navy' : 'hover:bg-cream-deep')}
              >
                {r === 0 ? 'Cualquiera' : `⭐ ${r}+`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label-base">Precio máximo de referencia</p>
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
                onClick={() => setMaxPrecio(p.v)}
                className={'chip ' + (maxPrecio === p.v ? 'bg-navy text-cream border-navy' : 'hover:bg-cream-deep')}
              >
                {p.l}
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
          <p className="font-mono text-xs uppercase tracking-widest text-ember">Buscar</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold">
            Oficios y herramientas
          </h1>
          <p className="mt-2 text-ink-500">
            {resultados.length} resultado{resultados.length === 1 ? '' : 's'}
            {tipo !== 'todos' && (
              <>
                {' '}— viendo solo{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTipo('todos')
                    sync('tipo', '')
                  }}
                  className="text-ember underline"
                >
                  {tipo}
                </button>
              </>
            )}
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
              placeholder="gasfíter, taladro, retroexcavadora…"
              className="pl-9"
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
              { value: 'recientes', label: 'Más populares' },
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
          {loading ? (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="card p-0 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-ink-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-2/3 rounded bg-ink-100" />
                    <div className="h-3 w-1/2 rounded bg-ink-100" />
                    <div className="h-3 w-1/3 rounded bg-ink-100" />
                  </div>
                </li>
              ))}
            </ul>
          ) : resultados.length === 0 ? (
            <EmptyState
              title={
                items.length === 0
                  ? 'La plataforma está arrancando'
                  : 'Sin resultados con esos filtros'
              }
              description={
                items.length === 0
                  ? 'Aún no hay oficios ni equipos publicados. Si tienes un oficio o herramienta para arrendar, sé de los primeros en publicar.'
                  : 'Ajusta los filtros o pregúntale al asistente IA qué se ajusta a tu proyecto.'
              }
              action={
                items.length === 0 ? (
                  <Link to="/registro" className="btn-ember btn-md mt-3">
                    Crear cuenta y publicar
                  </Link>
                ) : (
                  <Link to="/asistente" className="btn-ember btn-md mt-3">
                    <Zap className="h-4 w-4" /> Preguntar al asistente
                  </Link>
                )
              }
            />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {resultados.map((it) =>
                it.kind === 'servicio' ? (
                  <CardServicio key={`s-${it.data.id}`} item={it} />
                ) : (
                  <CardHerramienta key={`h-${it.data.id}`} item={it} />
                ),
              )}
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

function CardServicio({ item }: { item: ItemServicio }) {
  const { data: s, user: u } = item
  return (
    <li>
      <Link to={`/servicio/${s.id}`} className="card group block p-0 overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
          <img
            src={s.galeriaTrabajos[0]}
            alt={s.oficio}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
          <Badge tone="ember" solid className="absolute left-3 top-3">
            <Hammer className="h-3 w-3" /> Oficio
          </Badge>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Avatar src={u?.fotoPerfil} name={u?.nombre} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {u?.nombre} {u?.apellido}
              </p>
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
              <PriceTag
                value={s.tarifaReferencia.monto}
                unit={s.tarifaReferencia.tipo}
                size="sm"
              />
            ) : (
              <span className="font-mono text-xs text-ink-400">A convenir</span>
            )}
            <span className="chip bg-cream-soft">{u?.comuna}</span>
          </div>
        </div>
      </Link>
    </li>
  )
}

function CardHerramienta({ item }: { item: ItemHerramienta }) {
  const { data: h, user: owner } = item
  return (
    <li>
      <Link to={`/herramienta/${h.id}`} className="card group block p-0 overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
          <img
            src={h.fotos[0]}
            alt={h.titulo}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
          <Badge tone="navy" solid className="absolute left-3 top-3">
            <Wrench className="h-3 w-3" /> Equipo
          </Badge>
          {h.requiereEntrega && (
            <span className="absolute right-3 top-3 chip-solid bg-moss text-cream">
              <Truck className="h-3 w-3" /> Delivery
            </span>
          )}
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
}
