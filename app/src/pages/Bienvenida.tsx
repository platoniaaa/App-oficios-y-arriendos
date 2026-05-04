import { useNavigate } from 'react-router-dom'
import { useModo, type Modo } from '@/stores/useModo'
import { Logo } from '@/components/ui/Logo'
import { ArrowRight, Hammer, HardHat, ShieldCheck, Sparkles, Wrench, Truck } from 'lucide-react'
import { brand } from '@/config/brand'

export function Bienvenida() {
  const setModo = useModo((s) => s.setModo)
  const nav = useNavigate()

  function elegir(m: Modo) {
    setModo(m)
    nav('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-page flex min-h-screen flex-col py-10">
        <header className="flex items-center justify-between">
          <Logo />
          <div className="hidden items-center gap-2 text-xs text-ink-500 sm:flex">
            <ShieldCheck className="h-4 w-4 text-moss" />
            Pago protegido en cada trabajo
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-12">
          <p className="font-mono text-xs uppercase tracking-widest text-ember">Bienvenido a {brand.name}</p>
          <h1 className="mt-3 max-w-3xl text-center font-display text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            ¿Cómo vas a usar Cuadrilla?
          </h1>
          <p className="mt-3 max-w-xl text-center text-base text-ink-500">
            Elige tu camino para que veas lo que de verdad te sirve. Puedes cambiarlo cuando quieras.
          </p>

          <div className="mt-12 grid w-full max-w-4xl gap-4 md:grid-cols-2">
            <CardModo
              tone="ember"
              title="Soy particular"
              kicker="Para mi casa"
              description="Necesito un maestro para algo puntual: un arreglo, una instalación, una mejora en mi casa o departamento."
              bullets={[
                { icon: <HardHat className="h-4 w-4" />, text: 'Encuentra al maestro indicado en tu comuna' },
                { icon: <ShieldCheck className="h-4 w-4" />, text: 'Pago protegido — solo pagas cuando esté listo' },
                { icon: <Sparkles className="h-4 w-4" />, text: 'Asistente IA si no sabes a quién llamar' },
              ]}
              cta="Buscar maestros"
              onClick={() => elegir('particular')}
            />

            <CardModo
              tone="navy"
              title="Soy contratista o empresa"
              kicker="Para mis proyectos"
              description="Gestiono obras y necesito orquestar cuadrillas, arrendar herramientas y coordinar pagos en un solo lugar."
              bullets={[
                { icon: <Hammer className="h-4 w-4" />, text: 'Subcontrata cuadrillas para tus proyectos' },
                { icon: <Wrench className="h-4 w-4" />, text: 'Arrienda herramientas y maquinaria' },
                { icon: <Truck className="h-4 w-4" />, text: 'Cotiza obra completa con un solo proveedor' },
              ]}
              cta="Gestionar mi obra"
              onClick={() => elegir('profesional')}
            />
          </div>

          <button
            type="button"
            onClick={() => elegir('particular')}
            className="mt-10 text-xs font-medium text-ink-400 underline underline-offset-2 hover:text-navy"
          >
            Solo quiero echar un vistazo
          </button>
        </section>
      </div>
    </div>
  )
}

function CardModo({
  tone,
  title,
  kicker,
  description,
  bullets,
  cta,
  onClick,
}: {
  tone: 'ember' | 'navy'
  title: string
  kicker: string
  description: string
  bullets: { icon: React.ReactNode; text: string }[]
  cta: string
  onClick: () => void
}) {
  const isEmber = tone === 'ember'
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'group relative flex flex-col gap-5 overflow-hidden rounded-3xl border-2 p-7 text-left transition ' +
        (isEmber
          ? 'border-ember/30 bg-ember/5 hover:border-ember hover:bg-ember/10'
          : 'border-ink-200 bg-white hover:border-navy hover:bg-ink-50')
      }
    >
      <div
        className={
          'pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30 blur-3xl ' +
          (isEmber ? 'bg-ember' : 'bg-navy')
        }
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className={'font-mono text-[10px] font-semibold uppercase tracking-widest ' + (isEmber ? 'text-ember-600' : 'text-ink-500')}>
            {kicker}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold leading-tight md:text-3xl">{title}</h2>
        </div>
        <ArrowRight className="h-6 w-6 shrink-0 translate-x-0 text-ink-400 transition group-hover:translate-x-1 group-hover:text-navy" />
      </div>

      <p className="relative text-sm text-ink-500">{description}</p>

      <ul className="relative space-y-2">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-navy">
            <span className={'inline-flex h-6 w-6 items-center justify-center rounded-full ' + (isEmber ? 'bg-ember/15 text-ember-600' : 'bg-navy/10 text-navy')}>
              {b.icon}
            </span>
            {b.text}
          </li>
        ))}
      </ul>

      <div className="relative pt-2">
        <span
          className={
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ' +
            (isEmber ? 'bg-ember text-white' : 'bg-navy text-white')
          }
        >
          {cta}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </button>
  )
}
