import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { usersById } from '@/mocks/users'
import { servicios } from '@/mocks/servicios'
import { herramientas } from '@/mocks/herramientas'
import { useResenas } from '@/stores/useResenas'
import { useAuth } from '@/stores/useAuth'
import { useChat } from '@/stores/useChat'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { Button } from '@/components/ui/Button'
import { Badge, VerificationBadge } from '@/components/ui/Badge'
import { PriceTag } from '@/components/ui/PriceTag'
import { RatingDistribution } from '@/components/feature/RatingDistribution'
import { StatProgress } from '@/components/feature/StatProgress'
import { GaleriaLightbox } from '@/components/feature/GaleriaLightbox'
import {
  MapPin,
  CalendarDays,
  MessageCircle,
  Sparkles,
  Clock,
  CheckCircle2,
  ThumbsUp,
  Hammer,
  Truck,
  Star,
  Languages,
  ShieldCheck,
} from 'lucide-react'
import { formatDate, formatRelative, pluralize } from '@/lib/format'

type Tab = 'servicios' | 'herramientas' | 'resenas'

export function PerfilPublico() {
  const { userId } = useParams()
  const u = userId ? usersById[userId] : undefined
  const [tab, setTab] = useState<Tab>('servicios')
  const [filtroEstrellas, setFiltroEstrellas] = useState<number | 'todas'>('todas')
  const [resenasVisibles, setResenasVisibles] = useState(5)
  const me = useAuth((s) => s.user())
  const nav = useNavigate()
  const startOrGet = useChat((s) => s.startOrGet)
  const paraUsuario = useResenas((s) => s.paraUsuario)

  if (!u) return <Navigate to="/" replace />

  const misServicios = servicios.filter((s) => s.trabajadorId === u.id)
  const misHerramientas = herramientas.filter((h) => h.propietarioId === u.id)
  const resenas = paraUsuario(u.id)
  const totalTrabajos = u.totalTrabajosCompletados ?? u.totalArriendosCompletados ?? 0
  const esNuevo = !!u.nuevoEnPlataforma || (resenas.length === 0 && totalTrabajos === 0)
  const galeriaDeTrabajos = misServicios.flatMap((s) => s.galeriaTrabajos).slice(0, 9)

  const tabs: { id: Tab; label: string; visible: boolean }[] = [
    { id: 'servicios', label: `Servicios (${misServicios.length})`, visible: u.roles.includes('trabajador') },
    { id: 'herramientas', label: `Herramientas (${misHerramientas.length})`, visible: u.roles.includes('arrendador') },
    { id: 'resenas', label: `Reseñas (${resenas.length})`, visible: true },
  ]
  const visibleTabs = tabs.filter((t) => t.visible)
  const actual = visibleTabs.find((t) => t.id === tab) ?? visibleTabs[0]

  const resenasFiltradas = useMemo(() => {
    const base = filtroEstrellas === 'todas' ? resenas : resenas.filter((r) => Math.round(r.estrellas) === filtroEstrellas)
    return base.sort((a, b) => b.fecha.localeCompare(a.fecha))
  }, [resenas, filtroEstrellas])

  return (
    <div className="container-page py-8 md:py-12">
      {/* HEADER */}
      <section className="card relative overflow-hidden p-6 md:p-8">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-ember/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col gap-6 md:flex-row">
          <Avatar src={u.fotoPerfil} name={u.nombre} size="xl" ring />
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ember-600">
              {u.tipo === 'empresa' ? 'Empresa verificada' : 'Persona'} · {u.roles.filter((r) => r !== 'cliente').join(' · ') || 'cliente'}
            </p>
            <h1 className="mt-1 font-display text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-balance">
              {u.nombre} {u.apellido ?? ''}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {u.comuna}, {u.region}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> Miembro desde {formatDate(u.fechaRegistro)}
              </span>
              {u.respuestaPromedioHrs !== undefined && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Responde en ~{u.respuestaPromedioHrs}h
                </span>
              )}
            </div>

            {/* rating y métricas grandes */}
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold tabular-nums">
                    {u.calificacionPromedio.toFixed(1)}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={
                          n <= Math.round(u.calificacionPromedio)
                            ? 'h-4 w-4 fill-ember text-ember'
                            : 'h-4 w-4 text-ink-300'
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-ink-500">{pluralize(u.totalResenas, 'reseña')}</p>
              </div>
              <div>
                <p className="font-display text-4xl font-semibold tabular-nums">{totalTrabajos}</p>
                <p className="text-xs text-ink-500">
                  {u.roles.includes('arrendador') ? 'arriendos completados' : 'trabajos completados'}
                </p>
              </div>
              <div>
                <p className="font-display text-4xl font-semibold tabular-nums">
                  {Math.round((u.tasaRecomendacion ?? 0) * 100)}%
                </p>
                <p className="text-xs text-ink-500">clientes recomiendan</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {esNuevo && (
                <Badge tone="ember" solid>
                  <Sparkles className="h-3 w-3" /> Nuevo en la plataforma
                </Badge>
              )}
              <VerificationBadge estado={u.verificacion.rut} label="RUT" />
              <VerificationBadge estado={u.verificacion.cedula} label="Cédula" />
              <VerificationBadge estado={u.verificacion.antecedentes} label="Antecedentes" />
              <VerificationBadge estado={u.verificacion.certificaciones} label="Certificaciones" />
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2 md:w-64 md:shrink-0">
            <Button
              variant="ember"
              size="lg"
              onClick={() => {
                if (!me) return nav('/login')
                const conv = startOrGet(me.id, u.id)
                nav(`/panel/chats/${conv.id}`)
              }}
            >
              <MessageCircle className="h-4 w-4" /> Contactar
            </Button>
            {u.roles.includes('trabajador') && misServicios[0] && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => nav(`/servicio/${misServicios[0].id}`)}
              >
                <Hammer className="h-4 w-4" /> Contratar servicio
              </Button>
            )}
            {u.roles.includes('arrendador') && misHerramientas[0] && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => nav(`/herramienta/${misHerramientas[0].id}`)}
              >
                <Truck className="h-4 w-4" /> Ver herramientas
              </Button>
            )}
            <div className="mt-2 rounded-xl border border-moss/30 bg-moss/5 p-3 text-xs text-moss">
              <ShieldCheck className="mb-1 inline h-3.5 w-3.5" /> Protección escrow en cada contratación.
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      {(u.bio || u.idiomas?.length) && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-3">Sobre {u.tipo === 'empresa' ? 'la empresa' : u.nombre.split(' ')[0]}</h2>
          {u.bio && <p className="text-ink-500 text-pretty max-w-3xl">{u.bio}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {u.idiomas?.map((i) => (
              <span key={i} className="chip">
                <Languages className="h-3 w-3" /> {i}
              </span>
            ))}
            {misServicios[0]?.experienciaAnios && (
              <span className="chip bg-ember/10 border-ember/30 text-ember-600">
                {misServicios[0].experienciaAnios} años de experiencia
              </span>
            )}
          </div>
        </section>
      )}

      {/* STATS CONFIANZA */}
      {!esNuevo && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold mb-5">Estadísticas de confianza</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-6 space-y-5">
              {u.tasaCumplimiento !== undefined && <StatProgress label="Tasa de cumplimiento" value={u.tasaCumplimiento} color="moss" />}
              {u.tasaPuntualidad !== undefined && <StatProgress label="Puntualidad" value={u.tasaPuntualidad} color="ember" />}
              {u.tasaRespuesta !== undefined && <StatProgress label="Responde a mensajes" value={u.tasaRespuesta} color="navy" />}
              {u.tasaRecomendacion !== undefined && <StatProgress label="Clientes que recomiendan" value={u.tasaRecomendacion} color="ember" />}
            </div>
            <div className="card p-6">
              <p className="font-mono text-xs uppercase text-ink-400">Distribución de calificaciones</p>
              <div className="mt-4">
                <RatingDistribution resenas={resenas} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TABS */}
      <section className="mt-12">
        <nav className="flex gap-1 border-b border-ink-200">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={
                'relative px-4 py-3 text-sm font-semibold transition ' +
                (actual?.id === t.id ? 'text-navy' : 'text-ink-400 hover:text-navy')
              }
            >
              {t.label}
              {actual?.id === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-ember" />}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {actual?.id === 'servicios' && (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {misServicios.map((s) => (
                <li key={s.id}>
                  <Link to={`/servicio/${s.id}`} className="card group block p-0 overflow-hidden">
                    <div className="aspect-[4/3] bg-ink-100 overflow-hidden">
                      <img src={s.galeriaTrabajos[0]} alt={s.oficio} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="font-display text-lg font-semibold">{s.oficio}</p>
                      <p className="line-clamp-2 text-xs text-ink-500">{s.descripcion}</p>
                      <div className="flex items-center justify-between pt-1">
                        {s.tarifaReferencia.monto ? (
                          <PriceTag value={s.tarifaReferencia.monto} unit={s.tarifaReferencia.tipo} size="sm" />
                        ) : (
                          <span className="font-mono text-xs text-ink-400">A convenir</span>
                        )}
                        <StarRating value={s.calificacion} size="sm" showNumber />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {actual?.id === 'herramientas' && (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {misHerramientas.map((h) => (
                <li key={h.id}>
                  <Link to={`/herramienta/${h.id}`} className="card group block p-0 overflow-hidden">
                    <div className="aspect-[4/3] bg-ink-100 overflow-hidden">
                      <img src={h.fotos[0]} alt={h.titulo} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="font-display text-lg font-semibold leading-tight">{h.titulo}</p>
                      <div className="flex items-center justify-between">
                        <PriceTag value={h.tarifa.porDia} unit="día" size="sm" />
                        <Badge tone={h.estadoOperacional === 'arrendada' ? 'ember' : h.estadoOperacional === 'mantenimiento' ? 'ink' : 'moss'}>
                          {h.estadoOperacional ?? 'disponible'}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {actual?.id === 'resenas' && (
            <div className="space-y-6">
              {/* filtros */}
              <div className="flex flex-wrap gap-2">
                {(['todas', 5, 4, 3, 2, 1] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFiltroEstrellas(f)}
                    className={
                      'chip ' +
                      (filtroEstrellas === f ? 'bg-navy text-white border-navy' : 'hover:bg-ink-100')
                    }
                  >
                    {f === 'todas' ? 'Todas' : `${f}★`}
                  </button>
                ))}
              </div>

              {resenasFiltradas.length === 0 ? (
                <p className="text-sm text-ink-400 italic">No hay reseñas con este filtro.</p>
              ) : (
                <ul className="space-y-4">
                  {resenasFiltradas.slice(0, resenasVisibles).map((r) => {
                    const autor = usersById[r.autorId]
                    return (
                      <li key={r.id} className="card p-5">
                        <div className="flex items-start gap-3">
                          <Avatar src={autor?.fotoPerfil} name={autor?.nombre} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <Link to={`/perfil/${autor?.id}`} className="font-semibold hover:text-ember">
                                  {autor?.nombre}
                                </Link>
                                <p className="text-xs text-ink-400">{formatRelative(r.fecha)}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <Star
                                    key={n}
                                    className={
                                      n <= r.estrellas
                                        ? 'h-4 w-4 fill-ember text-ember'
                                        : 'h-4 w-4 text-ink-300'
                                    }
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="mt-2 text-sm text-ink-500 text-pretty">{r.comentario}</p>

                            {r.subcategorias && (
                              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {Object.entries(r.subcategorias).map(
                                  ([k, v]) =>
                                    v !== undefined && (
                                      <div key={k} className="rounded-lg border border-ink-100 bg-ink-50 px-2 py-1.5">
                                        <p className="font-mono text-[9px] uppercase text-ink-400">
                                          {k === 'estadoEntrega' ? 'Entrega' : k}
                                        </p>
                                        <div className="mt-0.5 flex items-center gap-0.5">
                                          {[1, 2, 3, 4, 5].map((n) => (
                                            <Star
                                              key={n}
                                              className={
                                                n <= v
                                                  ? 'h-3 w-3 fill-ember text-ember'
                                                  : 'h-3 w-3 text-ink-300'
                                              }
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    ),
                                )}
                              </div>
                            )}

                            {r.respuesta && (
                              <div className="mt-3 rounded-xl border-l-4 border-ember bg-ember/5 p-3 text-sm">
                                <p className="font-semibold text-ember-600">Respuesta de {u.nombre.split(' ')[0]}:</p>
                                <p className="text-ink-500 mt-1">{r.respuesta.texto}</p>
                              </div>
                            )}

                            <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                              {r.recomienda && (
                                <span className="inline-flex items-center gap-1 text-moss">
                                  <CheckCircle2 className="h-3 w-3" /> Recomienda
                                </span>
                              )}
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 text-ink-500 hover:text-navy"
                              >
                                <ThumbsUp className="h-3 w-3" /> Útil
                                {r.utiles ? ` · ${r.utiles}` : ''}
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
              {resenasFiltradas.length > resenasVisibles && (
                <div className="text-center">
                  <Button variant="outline" size="md" onClick={() => setResenasVisibles((n) => n + 5)}>
                    Ver más reseñas
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ZONAS */}
      {u.roles.includes('trabajador') && misServicios[0]?.zonasCobertura.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold mb-3">Zonas de cobertura</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(misServicios.flatMap((s) => s.zonasCobertura))).map((c) => (
              <span key={c} className="chip bg-ink-100">
                <MapPin className="h-3 w-3" /> {c}
              </span>
            ))}
          </div>
        </section>
      )}

      {u.roles.includes('arrendador') && misHerramientas.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold mb-3">Ubicaciones de retiro</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(misHerramientas.map((h) => h.comunaUbicacion))).map((c) => (
              <span key={c} className="chip bg-ink-100">
                <MapPin className="h-3 w-3" /> {c}
              </span>
            ))}
          </div>
          <div className="mt-4 aspect-[3/1] rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50 flex items-center justify-center text-sm text-ink-400">
            Mapa placeholder · integración futura con Google Maps / Mapbox
          </div>
        </section>
      )}

      {/* CERTIFICACIONES */}
      {misServicios.flatMap((s) => s.certificaciones).length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold mb-4">Certificaciones</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {misServicios
              .flatMap((s) => s.certificaciones)
              .map((c) => (
                <li key={c.id} className="card flex items-start gap-3 p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-moss/10 text-moss">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{c.nombre}</p>
                    <p className="text-xs text-ink-400">
                      {c.institucion ?? ''} {c.anio ? `· ${c.anio}` : ''}
                    </p>
                  </div>
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* GALERÍA */}
      {galeriaDeTrabajos.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold mb-4">Galería de trabajos</h2>
          <GaleriaLightbox imagenes={galeriaDeTrabajos} cols={3} />
        </section>
      )}

      {/* FAQ */}
      {u.faq && u.faq.length > 0 && (
        <section className="mt-12 max-w-3xl">
          <h2 className="font-display text-2xl font-semibold mb-4">Preguntas frecuentes</h2>
          <div className="divide-y divide-ink-100 rounded-2xl border border-ink-200">
            {u.faq.map((f, i) => (
              <details key={i} className="group p-4 open:bg-ink-50">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                  {f.q}
                  <span className="text-xl transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm text-ink-500">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* CTA inferior */}
      <section className="mt-14 card p-6 md:p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-2xl font-semibold">¿Te interesa trabajar con {u.nombre.split(' ')[0]}?</p>
          <p className="text-sm text-ink-500 mt-1">
            Abre una conversación sin compromiso o solicita una cotización.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              if (!me) return nav('/login')
              const conv = startOrGet(me.id, u.id)
              nav(`/panel/chats/${conv.id}`)
            }}
          >
            <MessageCircle className="h-4 w-4" /> Enviar mensaje
          </Button>
          {u.roles.includes('trabajador') && misServicios[0] && (
            <Button variant="ember" size="md" onClick={() => nav(`/servicio/${misServicios[0].id}`)}>
              Solicitar cotización
            </Button>
          )}
          {u.roles.includes('arrendador') && !u.roles.includes('trabajador') && misHerramientas[0] && (
            <Button variant="ember" size="md" onClick={() => nav(`/herramienta/${misHerramientas[0].id}`)}>
              Ver catálogo
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}
