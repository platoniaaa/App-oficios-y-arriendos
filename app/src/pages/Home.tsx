import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Sparkles, MessageSquare, Star, Wrench, Hammer, UserPlus } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { oficios, categoriasHerramientas } from '@/mocks/categorias'
import { formatCLP } from '@/lib/format'
import { PriceTag } from '@/components/ui/PriceTag'
import { useFetch } from '@/hooks/useFetch'
import { listServicios } from '@/lib/queries/servicios'
import { listHerramientas } from '@/lib/queries/herramientas'

export function Home() {
  const { data: servicios } = useFetch(() => listServicios(), [])
  const { data: herramientas } = useFetch(() => listHerramientas(), [])
  const hayServicios = (servicios?.length ?? 0) > 0
  const hayHerramientas = (herramientas?.length ?? 0) > 0

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b-2 border-navy/10">
        <div className="absolute inset-0 bg-hatch opacity-60 pointer-events-none" />
        <div className="container-page relative grid items-center gap-10 py-14 md:grid-cols-12 md:py-24">
          <div className="md:col-span-7 space-y-7 animate-fade-up">
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-ink-500">
              <span className="inline-block h-2 w-2 rounded-full bg-ember animate-pulse-dot" />
              Marketplace chileno · pagos protegidos
            </div>
            <h1 className="font-display text-display-xl font-semibold tracking-tight text-balance">
              Oficios y <span className="italic text-ember">herramientas</span>
              <br />
              a la mano.
            </h1>
            <p className="max-w-xl text-lg text-ink-500 text-pretty">
              Encuentra al maestro indicado o arrienda la máquina que necesitas. Para tu casa o tu obra,
              en un solo lugar. Pagas al final, cuando el trabajo esté listo.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/asistente" className="btn-ember btn-lg">
                <Sparkles className="h-4 w-4" /> Arma tu proyecto con IA
              </Link>
              <Link to="/buscar?tipo=servicios" className="btn-outline btn-lg">
                Ver oficios <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-5 pt-4 text-sm text-ink-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-moss" />
                Escrow en cada trabajo
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-ember" />
                Reseñas verificadas
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-navy" />
                Chat directo con la otra parte
              </div>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className="relative mx-auto max-w-sm">
              {/* Ticket ilustrativo del flujo escrow — datos genéricos, no son un usuario real */}
              <div className="ticket rotate-[-2deg] p-4 relative z-10" aria-label="Ejemplo de ticket de contratación">
                <div className="flex items-center justify-between border-b border-dashed border-navy/30 pb-3 text-xs font-mono uppercase">
                  <span>Ejemplo · ticket de escrow</span>
                  <span className="stamp">Escrow</span>
                </div>
                <div className="py-4 space-y-2 text-sm">
                  <p className="font-mono text-[10px] uppercase text-ink-400">Servicio</p>
                  <p className="font-display text-2xl font-semibold leading-tight">
                    Reparación de filtración en baño
                  </p>
                </div>
                <div className="rule-dashed" />
                <div className="grid grid-cols-2 gap-3 py-3 text-sm">
                  <div>
                    <p className="font-mono text-[10px] uppercase text-ink-400">Visita</p>
                    <p className="font-semibold">{formatCLP(35000)}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase text-ink-400">Cobertura</p>
                    <p className="font-semibold">Tu comuna</p>
                  </div>
                </div>
                <div className="rule-dashed" />
                <div className="pt-3 flex items-center gap-2 text-xs font-semibold text-moss">
                  <ShieldCheck className="h-4 w-4" /> Tu pago se libera al aprobar el trabajo
                </div>
              </div>

              <div className="ticket-sm rotate-[4deg] absolute -right-6 top-8 w-56 p-4 bg-navy text-cream">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-cream/60">
                  <span>Arriendo</span>
                  <span>Por día</span>
                </div>
                <p className="mt-2 font-display text-base leading-tight">
                  Maquinaria <br /> con operador
                </p>
                <PriceTag value={280000} unit="día" size="sm" className="mt-3 text-ember" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden border-y border-navy/10 bg-cream-soft">
          <div className="flex gap-10 whitespace-nowrap py-3 text-xs font-mono uppercase text-ink-500 animate-marquee">
            {Array.from({ length: 2 }).flatMap((_, k) =>
              [
                'Gasfíter',
                'Eléctrico',
                'Retroexcavadora',
                'Maestro construcción',
                'Nivel láser',
                'Paisajista',
                'Soldador MIG',
                'Hidrolavadora',
                'Cerrajero 24/7',
                'Betonera 180L',
              ].map((w, i) => (
                <span key={`${k}-${i}`} className="inline-flex items-center gap-2">
                  {w}
                  <span className="text-ember">✦</span>
                </span>
              )),
            )}
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ember">01 — Oficios</p>
            <h2 className="font-display text-4xl font-semibold">Por categoría</h2>
          </div>
          <Link to="/buscar?tipo=servicios" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold hover:text-ember">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {oficios.slice(0, 8).map((o) => (
            <Link
              key={o.id}
              to={`/buscar?tipo=servicios&cat=${encodeURIComponent(o.nombre)}`}
              className="group relative overflow-hidden rounded-2xl border-2 border-navy/10 bg-paper p-5 transition hover:border-navy hover:shadow-ticket-sm"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-ember/10 text-ember-600">
                <Hammer className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{o.nombre}</h3>
              <p className="mt-1 text-xs text-ink-400">{o.subcategorias?.slice(0, 2).join(' · ')}</p>
              <ArrowRight className="absolute right-4 top-4 h-4 w-4 translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>

      {/* TRABAJADORES DESTACADOS o llamado a sumar maestros */}
      {!hayServicios && (
        <section className="container-page py-16">
          <div className="rounded-3xl border-2 border-dashed border-navy/20 bg-cream-soft p-10 text-center">
            <UserPlus className="mx-auto h-10 w-10 text-ember" />
            <h2 className="mt-4 font-display text-3xl font-semibold">
              Sé uno de los primeros maestros en Cuadrilla
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-ink-500">
              Estamos arrancando. Si ofreces un oficio, publica tu perfil ahora y aparece
              destacado para los primeros clientes que lleguen a la plataforma.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/registro" className="btn-ember btn-md">
                Crear cuenta gratis
              </Link>
              <Link to="/como-funciona" className="btn-outline btn-md">
                Cómo funciona
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CÓMO FUNCIONA */}
      <section className="bg-navy text-cream py-20">
        <div className="container-page">
          <p className="font-mono text-xs uppercase tracking-widest text-ember">03 — Cómo funciona</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-1 mb-10 text-cream">
            Contratar con confianza, <br />
            sin dramas en la cancha.
          </h2>
          <ol className="grid gap-6 md:grid-cols-4">
            {[
              { n: '01', t: 'Busca o pregúntale a la IA', d: 'Describe tu proyecto o elige directamente al maestro o herramienta.' },
              { n: '02', t: 'Acuerda y paga al escrow', d: 'Tu plata queda en custodia hasta que el trabajo esté listo.' },
              { n: '03', t: 'Se ejecuta la pega', d: 'Chat directo, documentos y visitas programadas.' },
              { n: '04', t: 'Apruebas y califican', d: 'Liberas el pago, dejas reseña y listo para la próxima.' },
            ].map((s) => (
              <li key={s.n} className="rounded-2xl border border-cream/15 bg-cream/5 p-6">
                <p className="font-mono text-ember text-sm">{s.n}</p>
                <h3 className="font-display text-2xl mt-2">{s.t}</h3>
                <p className="mt-2 text-cream/70 text-sm">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* HERRAMIENTAS por categoría (sin grid de productos hasta que haya inventario real) */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ember">04 — Arriendo</p>
            <h2 className="font-display text-4xl font-semibold">Herramientas y maquinaria</h2>
            {!hayHerramientas && (
              <p className="mt-2 text-sm text-ink-500">
                ¿Tienes equipos sin uso? Publícalos y genera ingresos.
              </p>
            )}
          </div>
          <Link to="/buscar?tipo=herramientas" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold hover:text-ember">
            Ver catálogo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {categoriasHerramientas.map((c) => (
            <Link
              key={c.id}
              to={`/buscar?tipo=herramientas&cat=${encodeURIComponent(c.nombre)}`}
              className="chip hover:bg-navy hover:text-cream transition"
            >
              <Wrench className="h-3 w-3" /> {c.nombre}
            </Link>
          ))}
        </div>

        {!hayHerramientas && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-white p-5">
            <p className="text-sm text-ink-500">
              <strong className="text-navy">Aún no hay equipos publicados.</strong> Sé el primero en arrendar tu maquinaria.
            </p>
            <Link to="/registro" className="btn-primary btn-sm">
              Publicar mi equipo
            </Link>
          </div>
        )}
      </section>

      {/* LO MÁS PEDIDO */}
      <section className="container-page py-16">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-ember">05 — Lo más pedido</p>
          <h2 className="font-display text-4xl font-semibold">Las pegas más comunes</h2>
          <p className="mt-2 text-ink-500">Para tu casa o tu obra — empieza por aquí.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { titulo: 'Reparar fuga de agua', icon: '💧', cat: 'Gasfíter' },
            { titulo: 'Cambiar calefont', icon: '🔥', cat: 'Gasfíter' },
            { titulo: 'Pintar departamento', icon: '🎨', cat: 'Pintor' },
            { titulo: 'Mantención de jardín', icon: '🌿', cat: 'Jardinero' },
            { titulo: 'Cerradura nueva', icon: '🔐', cat: 'Cerrajero' },
            { titulo: 'Lavadora no enciende', icon: '🧺', cat: 'Técnico en línea blanca' },
            { titulo: 'Aire acondicionado', icon: '❄️', cat: 'Climatización / Refrigeración' },
            { titulo: 'Mudanza simple', icon: '📦', cat: 'Fletero / Mudanzas' },
          ].map((it) => (
            <Link
              key={it.titulo}
              to={`/buscar?tipo=servicios&cat=${encodeURIComponent(it.cat)}`}
              className="group rounded-2xl border border-ink-200 bg-white p-5 transition hover:border-ember hover:shadow-card"
            >
              <span className="text-2xl">{it.icon}</span>
              <p className="mt-3 font-display text-lg font-semibold leading-tight">{it.titulo}</p>
              <p className="mt-1 text-xs text-ink-400">{it.cat}</p>
              <ArrowRight className="mt-3 h-4 w-4 translate-x-0 text-ink-400 transition group-hover:translate-x-1 group-hover:text-ember" />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA IA */}
      <section className="container-page py-20">
        <div className="ticket relative overflow-hidden p-10 md:p-14">
          <div className="absolute inset-0 bg-hatch opacity-50 pointer-events-none" />
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <Logo />
              <h2 className="font-display text-4xl md:text-5xl font-semibold mt-6 leading-tight">
                Cuéntale tu proyecto al asistente. <br />
                <span className="text-ember italic">Él arma la cuadrilla.</span>
              </h2>
              <p className="mt-4 text-ink-500 max-w-md">
                La IA entiende qué necesitas, recomienda maestros de tu zona, las herramientas
                adecuadas y te arma una cotización en segundos. Para reparaciones simples u obras completas.
              </p>
              <Link to="/asistente" className="btn-ember btn-lg mt-6 inline-flex">
                <Sparkles className="h-4 w-4" /> Probar asistente
              </Link>
            </div>
            <ul className="space-y-3">
              {[
                '"Se me filtra el lavamanos del baño"',
                '"Necesito arrendar una betonera este fin de semana"',
                '"Quiero remodelar un baño 3x2m"',
                '"Cuadrilla y equipos para ampliación de 80m²"',
              ].map((q) => (
                <li
                  key={q}
                  className="rounded-2xl border-2 border-navy bg-cream px-4 py-3 font-display italic shadow-ticket-sm"
                >
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
