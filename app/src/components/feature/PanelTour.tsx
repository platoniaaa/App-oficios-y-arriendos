import { useEffect, useLayoutEffect, useState } from 'react'
import { ArrowRight, ArrowLeft, X } from 'lucide-react'
import { isBienvenidaDone, isTourPanelDone, markTourPanelDone } from '@/lib/onboarding'

interface Step {
  target: string // selector data-tour="..."
  titulo: string
  texto: string
  placement?: 'right' | 'bottom' | 'left'
}

const steps: Step[] = [
  {
    target: '[data-tour="rol-switcher"]',
    titulo: 'Cambia de rol cuando quieras',
    texto:
      'Aquí alternas entre Cliente, Trabajador y Arrendador. Cada modo tiene su propio panel con las herramientas que necesitas.',
    placement: 'right',
  },
  {
    target: '[data-tour="panel-nav"]',
    titulo: 'Tu menú principal',
    texto:
      'Acá ves tus contrataciones, mensajes, reseñas y notificaciones. El badge naranja indica avisos pendientes.',
    placement: 'right',
  },
  {
    target: '[data-tour="header-publicar"]',
    titulo: 'Publica tu primer servicio o equipo',
    texto:
      'Desde este botón ofreces tu oficio o pones a arrendar tus herramientas en pocos pasos.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="header-asistente"]',
    titulo: 'Asistente IA',
    texto:
      'Si tienes un proyecto en mente y no sabes a quién contratar, descríbelo y la IA te recomienda maestros y equipos.',
    placement: 'bottom',
  },
]

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

function readRect(selector: string): Rect | null {
  const el = document.querySelector(selector) as HTMLElement | null
  if (!el) return null
  const r = el.getBoundingClientRect()
  return {
    top: r.top + window.scrollY,
    left: r.left + window.scrollX,
    width: r.width,
    height: r.height,
  }
}

export function PanelTour({ userId }: { userId: string }) {
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)

  // Activar solo si bienvenida completa y tour aún no hecho.
  useEffect(() => {
    if (!isBienvenidaDone(userId)) return
    if (isTourPanelDone(userId)) return
    // Pequeño delay para que el layout termine de pintarse
    const t = setTimeout(() => setActive(true), 350)
    return () => clearTimeout(t)
  }, [userId])

  // Recalcular rectángulo del target cuando cambia step / resize / scroll
  useLayoutEffect(() => {
    if (!active) return
    function update() {
      const s = steps[step]
      setRect(readRect(s.target))
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [active, step])

  // Scroll al target la primera vez que se muestra cada paso
  useEffect(() => {
    if (!active) return
    const el = document.querySelector(steps[step].target) as HTMLElement | null
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [active, step])

  if (!active) return null

  const total = steps.length
  const isLast = step === total - 1
  const current = steps[step]

  function close() {
    markTourPanelDone(userId)
    setActive(false)
  }

  // Posicionamiento del tooltip (alrededor del rect del target)
  const tooltip = computeTooltipPos(rect, current.placement ?? 'bottom')
  const padding = 8

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop oscuro con "agujero" en el target */}
      {rect && (
        <>
          {/* Overlay en cuatro partes para no tapar el target */}
          <div
            className="pointer-events-auto absolute inset-x-0 top-0 bg-navy/55"
            style={{ height: Math.max(0, rect.top - window.scrollY - padding) }}
          />
          <div
            className="pointer-events-auto absolute inset-x-0 bg-navy/55"
            style={{
              top: rect.top - window.scrollY + rect.height + padding,
              bottom: 0,
            }}
          />
          <div
            className="pointer-events-auto absolute bg-navy/55"
            style={{
              top: rect.top - window.scrollY - padding,
              left: 0,
              width: Math.max(0, rect.left - window.scrollX - padding),
              height: rect.height + padding * 2,
            }}
          />
          <div
            className="pointer-events-auto absolute bg-navy/55"
            style={{
              top: rect.top - window.scrollY - padding,
              left: rect.left - window.scrollX + rect.width + padding,
              right: 0,
              height: rect.height + padding * 2,
            }}
          />

          {/* Halo alrededor del target */}
          <div
            className="absolute rounded-2xl border-2 border-ember shadow-[0_0_0_4px_rgba(245,158,11,0.25)] transition-all duration-200"
            style={{
              top: rect.top - window.scrollY - padding,
              left: rect.left - window.scrollX - padding,
              width: rect.width + padding * 2,
              height: rect.height + padding * 2,
            }}
          />
        </>
      )}

      {/* Tooltip flotante */}
      <div
        className="pointer-events-auto absolute z-[101] w-[320px] max-w-[90vw] rounded-2xl border-2 border-navy bg-paper p-5 shadow-ticket animate-fade-up"
        style={tooltip}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ember">
              Paso {step + 1} de {total}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold leading-tight">
              {current.titulo}
            </h3>
          </div>
          <button
            type="button"
            className="rounded-full p-1 text-ink-400 hover:bg-ink-50 hover:text-navy"
            onClick={close}
            aria-label="Cerrar tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-ink-500">{current.texto}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {steps.map((_, i) => (
              <span
                key={i}
                className={
                  'h-1.5 w-4 rounded-full transition ' +
                  (i <= step ? 'bg-ember' : 'bg-navy/15')
                }
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft className="h-3 w-3" /> Atrás
              </button>
            )}
            {isLast ? (
              <button type="button" className="btn-ember btn-sm" onClick={close}>
                Listo
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => setStep(step + 1)}
              >
                Siguiente <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function computeTooltipPos(rect: Rect | null, placement: 'right' | 'bottom' | 'left'): React.CSSProperties {
  // Default: centro de la pantalla
  if (!rect) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }

  const margin = 16
  const w = 320
  const targetTop = rect.top - window.scrollY
  const targetLeft = rect.left - window.scrollX

  if (placement === 'right') {
    const left = targetLeft + rect.width + margin
    if (left + w < window.innerWidth) {
      return { top: targetTop, left }
    }
    // Fallback: bottom
    return {
      top: targetTop + rect.height + margin,
      left: Math.max(margin, Math.min(window.innerWidth - w - margin, targetLeft)),
    }
  }

  if (placement === 'left') {
    const left = targetLeft - w - margin
    if (left > 0) {
      return { top: targetTop, left }
    }
  }

  // placement bottom (default)
  return {
    top: targetTop + rect.height + margin,
    left: Math.max(margin, Math.min(window.innerWidth - w - margin, targetLeft)),
  }
}
