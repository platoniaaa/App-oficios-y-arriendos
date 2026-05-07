import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ShieldCheck,
  Hammer,
  Wrench,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/stores/useAuth'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { brand } from '@/config/brand'
import { markOnboardingDone } from '@/lib/onboarding'

export function Bienvenida() {
  const user = useAuth((s) => s.user())
  const nav = useNavigate()
  const [step, setStep] = useState(0)

  if (!user) return <Navigate to="/login" replace />

  const isTrabajador = user.roles.includes('trabajador')
  const isArrendador = user.roles.includes('arrendador')

  const slides: Slide[] = [
    {
      titulo: `¡Bienvenido a ${brand.name}, ${user.nombre.split(' ')[0]}!`,
      subtitulo: 'El marketplace chileno para encontrar oficios y arrendar herramientas.',
      icon: <Logo />,
      cuerpo: (
        <p className="text-ink-500">
          Aquí conectas con maestros verificados y dueños de equipos en tu comuna. Ya seas dueño
          de casa, contratista o trabajador independiente, todo pasa por un solo lugar.
        </p>
      ),
    },
    {
      titulo: 'Lo que puedes hacer en tu cuenta',
      subtitulo: 'Tienes acceso a todo desde el mismo panel.',
      icon: <Sparkles className="h-10 w-10 text-ember" />,
      cuerpo: (
        <ul className="grid gap-3">
          <Pista
            icon={<ShoppingBag className="h-5 w-5" />}
            titulo="Comprador"
            desc="Contrata maestros o arrienda herramientas. Pagas al final, cuando todo esté listo."
            activo
          />
          {isTrabajador && (
            <Pista
              icon={<Hammer className="h-5 w-5" />}
              titulo="Trabajador"
              desc="Publica tus servicios, recibe solicitudes, gestiona tu agenda y cobra al terminar."
              activo
            />
          )}
          {isArrendador && (
            <Pista
              icon={<Wrench className="h-5 w-5" />}
              titulo="Arrendador"
              desc="Publica tus equipos, controla disponibilidad y recibe pagos por arriendo."
              activo
            />
          )}
        </ul>
      ),
    },
    {
      titulo: 'Pago protegido en escrow',
      subtitulo: 'Tu plata queda segura hasta que el trabajo esté listo.',
      icon: <ShieldCheck className="h-10 w-10 text-moss" />,
      cuerpo: (
        <div className="space-y-3 text-ink-500">
          <p>
            Cuando contratas, tu pago se queda en custodia. El trabajador o arrendador recibe el
            dinero solo cuando tú apruebas el trabajo o devuelves la herramienta.
          </p>
          <p>
            Si algo sale mal, tienes 48 horas para abrir una disputa antes de que se libere el
            pago automáticamente.
          </p>
        </div>
      ),
    },
    {
      titulo: 'Antes de empezar',
      subtitulo: 'Estos son los siguientes pasos para sacarle todo el jugo.',
      icon: <CheckCircle2 className="h-10 w-10 text-ember" />,
      cuerpo: (
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-ember" />
            <span>
              <strong>Completa tu perfil:</strong> agrega foto, bio y verifica tu RUT desde
              "Mi cuenta".
            </span>
          </li>
          {(isTrabajador || isArrendador) && (
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-ember" />
              <span>
                <strong>Haz tu primera publicación:</strong> mientras más detalle tenga, mejor
                aparecerás en los resultados.
              </span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-ember" />
            <span>
              <strong>Prueba el asistente IA:</strong> describe tu proyecto y te recomienda
              maestros y herramientas.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-ember" />
            <span>
              <strong>Te haremos un tour rápido:</strong> al entrar al panel te mostraremos
              dónde está cada cosa.
            </span>
          </li>
        </ul>
      ),
    },
  ]

  const slide = slides[step]
  const isLast = step === slides.length - 1

  function finalizar() {
    markOnboardingDone(user!.id)
    nav('/panel')
  }

  return (
    <div className="container-page max-w-2xl py-12 md:py-20">
      <div className="ticket p-6 md:p-10 space-y-6 animate-fade-up">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-ink-400">
          <span>
            Paso {step + 1} de {slides.length}
          </span>
          <button
            type="button"
            className="text-ink-400 hover:text-ember"
            onClick={finalizar}
          >
            Saltar
          </button>
        </div>

        <div className="flex h-1.5 gap-1">
          {slides.map((_, i) => (
            <div
              key={i}
              className={
                'h-1.5 flex-1 rounded-full transition ' +
                (i <= step ? 'bg-ember' : 'bg-navy/10')
              }
            />
          ))}
        </div>

        <div className="space-y-4">
          <div>{slide.icon}</div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
            {slide.titulo}
          </h1>
          {slide.subtitulo && <p className="text-ink-500">{slide.subtitulo}</p>}
        </div>

        <div className="min-h-[120px]">{slide.cuerpo}</div>

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4" /> Atrás
          </Button>
          {isLast ? (
            <Button variant="ember" size="md" onClick={finalizar}>
              Ir a mi panel <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={() => setStep(step + 1)}>
              Continuar <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface Slide {
  titulo: string
  subtitulo?: string
  icon: React.ReactNode
  cuerpo: React.ReactNode
}

function Pista({
  icon,
  titulo,
  desc,
  activo,
}: {
  icon: React.ReactNode
  titulo: string
  desc: string
  activo: boolean
}) {
  return (
    <li
      className={
        'flex items-start gap-3 rounded-2xl border p-4 ' +
        (activo ? 'border-navy/20 bg-cream-soft' : 'border-navy/10 opacity-60')
      }
    >
      <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-cream">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-display font-semibold">{titulo}</p>
        <p className="text-sm text-ink-500">{desc}</p>
      </div>
    </li>
  )
}
