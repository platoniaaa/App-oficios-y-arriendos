import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating, InteractiveStars } from '@/components/ui/StarRating'
import { PriceTag } from '@/components/ui/PriceTag'
import { Badge, VerificationBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, MapPin, MessageCircle, Sparkles, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Input'
import { useAuth } from '@/stores/useAuth'
import { crearContratacion } from '@/lib/queries/contrataciones'
import { useChat } from '@/stores/useChat'
import { listResenasParaUsuario } from '@/lib/queries/resenas'
import { getProfilesByIds } from '@/lib/queries/perfiles'
import { formatRelative } from '@/lib/format'
import { fees } from '@/config/brand'
import { getServicio } from '@/lib/queries/servicios'
import { getProfile } from '@/lib/queries/perfiles'
import { useFetch } from '@/hooks/useFetch'

export function ServicioDetalle() {
  const { id } = useParams()
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [openContratar, setOpenContratar] = useState(false)
  const user = useAuth((s) => s.user())
  const nav = useNavigate()
  const startOrGet = useChat((s) => s.startOrGet)

  const { data, loading } = useFetch(async () => {
    if (!id) return null
    const servicio = await getServicio(id)
    if (!servicio) return null
    const [trab, resenas] = await Promise.all([
      getProfile(servicio.trabajadorId),
      listResenasParaUsuario(servicio.trabajadorId),
    ])
    const autoresById = await getProfilesByIds(resenas.map((r) => r.autorId))
    return { servicio, trab, resenas, autoresById }
  }, [id])

  if (loading) {
    return (
      <div className="container-page py-12 text-center text-ink-400">
        Cargando…
      </div>
    )
  }
  if (!data) return <Navigate to="/buscar?tipo=servicios" replace />
  const { servicio, trab, resenas, autoresById } = data

  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-6 flex items-center gap-1 text-xs font-mono uppercase text-ink-400">
        <Link to="/buscar?tipo=servicios" className="hover:text-navy">Oficios</Link>
        <span>/</span>
        <span>{servicio.oficio}</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <div className="ticket p-6">
            <div className="flex flex-wrap items-start gap-4">
              <Avatar src={trab?.fotoPerfil} name={trab?.nombre} size="xl" />
              <div className="flex-1">
                <p className="font-mono text-xs uppercase text-ink-400">
                  {trab?.tipo === 'persona' ? 'Trabajador' : 'Empresa'}
                </p>
                <h1 className="font-display text-4xl font-semibold leading-tight">
                  {trab?.nombre} {trab?.apellido}
                </h1>
                <p className="mt-1 text-lg text-ember-600 font-display">{servicio.oficio}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-500">
                  <StarRating value={servicio.calificacion} count={servicio.totalTrabajosRealizados} />
                  <span className="dot-divider">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {trab?.comuna}
                    </span>
                  </span>
                  <span className="chip bg-cream-soft">{servicio.experienciaAnios} años</span>
                </div>
              </div>
              <div className="hidden sm:flex items-end flex-col gap-2">
                {servicio.tarifaReferencia.monto ? (
                  <PriceTag value={servicio.tarifaReferencia.monto} unit={servicio.tarifaReferencia.tipo} size="lg" />
                ) : (
                  <span className="font-display text-2xl text-ink-500">A convenir</span>
                )}
                <span className="stamp">ref.</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {trab && <VerificationBadge estado={trab.verificacion.rut} label="RUT" />}
              {trab && <VerificationBadge estado={trab.verificacion.cedula} label="Cédula" />}
              {trab && <VerificationBadge estado={trab.verificacion.antecedentes} label="Antecedentes" />}
              {trab && <VerificationBadge estado={trab.verificacion.certificaciones} label="Certificaciones" />}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="ember" size="lg" onClick={() => setOpenContratar(true)}>
                <Sparkles className="h-4 w-4" /> Contratar
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={async () => {
                  if (!user) return nav('/login')
                  if (!trab) return
                  const conv = await startOrGet(user.id, trab.id)
                  nav(`/panel/chats/${conv.id}`)
                }}
              >
                <MessageCircle className="h-4 w-4" /> Enviar mensaje
              </Button>
              <Link to={`/perfil/${trab?.id}`} className="btn-ghost btn-lg">
                Ver perfil público
              </Link>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold mb-3">Sobre el servicio</h2>
            <p className="text-ink-500 whitespace-pre-line text-pretty">{servicio.descripcion}</p>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold mb-4">Galería</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {servicio.galeriaTrabajos.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIdx(i)}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-navy/10 bg-cream-deep"
                >
                  <img src={src} alt={`Trabajo ${i + 1}`} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                </button>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold mb-4">Cobertura y especialidades</h2>
            <div className="flex flex-wrap gap-2 mb-5">
              {servicio.categorias.map((c) => (
                <span key={c} className="chip">#{c}</span>
              ))}
            </div>
            <p className="label-base">Zonas donde atiende</p>
            <div className="flex flex-wrap gap-2">
              {servicio.zonasCobertura.map((c) => (
                <span key={c} className="chip bg-cream-soft">
                  <MapPin className="h-3 w-3" /> {c}
                </span>
              ))}
            </div>
          </section>

          {servicio.certificaciones.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-semibold mb-4">Certificaciones</h2>
              <ul className="space-y-2">
                {servicio.certificaciones.map((c) => (
                  <li key={c.id} className="flex items-start gap-3 rounded-xl border border-navy/10 p-3">
                    <CheckCircle2 className="h-5 w-5 text-moss mt-0.5" />
                    <div>
                      <p className="font-semibold">{c.nombre}</p>
                      {(c.institucion || c.anio) && (
                        <p className="text-xs text-ink-400">
                          {c.institucion ?? ''} {c.anio ? `· ${c.anio}` : ''}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {servicio.faq && servicio.faq.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-semibold mb-4">Preguntas frecuentes</h2>
              <div className="divide-y divide-navy/10 rounded-2xl border border-navy/10">
                {servicio.faq.map((f, i) => (
                  <details key={i} className="group p-4 open:bg-cream-soft">
                    <summary className="cursor-pointer list-none flex items-center justify-between font-semibold">
                      {f.q}
                      <span className="text-xl transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-2 text-sm text-ink-500">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section className="mt-12">
            <div className="flex items-end justify-between mb-4">
              <h2 className="font-display text-2xl font-semibold">Últimas reseñas</h2>
              <Link to={`/perfil/${trab?.id}`} className="text-sm font-semibold hover:text-ember">
                Ver todas
              </Link>
            </div>
            {resenas.length === 0 ? (
              <p className="text-sm text-ink-400 italic">Aún no hay reseñas.</p>
            ) : (
              <ul className="space-y-3">
                {resenas.slice(0, 3).map((r) => (
                  <li key={r.id} className="card p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar src={autoresById[r.autorId]?.fotoPerfil} name={autoresById[r.autorId]?.nombre} size="sm" />
                      <div>
                        <p className="font-semibold">{autoresById[r.autorId]?.nombre}</p>
                        <p className="text-xs text-ink-400">{formatRelative(r.fecha)}</p>
                      </div>
                      <div className="ml-auto">
                        <InteractiveStars value={r.estrellas} onChange={() => {}} size="md" />
                      </div>
                    </div>
                    <p className="text-sm text-ink-500">{r.comentario}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 self-start space-y-5">
          <div className="ticket p-5">
            <p className="font-mono text-xs uppercase text-ink-400">Tarifa referencial</p>
            <div className="mt-2">
              {servicio.tarifaReferencia.monto ? (
                <PriceTag value={servicio.tarifaReferencia.monto} unit={servicio.tarifaReferencia.tipo} size="lg" />
              ) : (
                <span className="font-display text-3xl">A convenir</span>
              )}
            </div>
            <p className="mt-3 text-sm text-ink-500">
              Comisión plataforma: {Math.round(fees.comisionPlataforma * 100)}%. El pago queda en escrow
              hasta que apruebes el trabajo.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="ember" size="lg" onClick={() => setOpenContratar(true)}>
                Solicitar contratación
              </Button>
              <Badge tone="moss" className="justify-center">
                <CheckCircle2 className="h-3 w-3" /> Protección Cuadrilla
              </Badge>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <p className="font-mono text-xs uppercase text-ink-400">Disponibilidad</p>
            <p className="font-display text-2xl capitalize">{servicio.disponibilidad}</p>
            <p className="text-sm text-ink-500">
              {servicio.disponibilidad === 'inmediata'
                ? 'Puede comenzar en las próximas 48 horas.'
                : servicio.disponibilidad === 'agendada'
                  ? 'Se coordina una fecha después de aceptar la cotización.'
                  : 'Actualmente ocupado. Puedes agendarte igualmente.'}
            </p>
          </div>
        </aside>
      </div>

      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 p-4" onClick={() => setLightboxIdx(null)}>
          <button className="absolute right-4 top-4 rounded-full bg-cream p-2" onClick={() => setLightboxIdx(null)}>
            <X className="h-5 w-5" />
          </button>
          <img
            src={servicio.galeriaTrabajos[lightboxIdx]}
            alt="Trabajo"
            className="max-h-full max-w-full rounded-2xl border-2 border-cream"
          />
        </div>
      )}

      <ContratarModal
        open={openContratar}
        onClose={() => setOpenContratar(false)}
        onSubmit={async (descripcion) => {
          if (!user) return nav('/login')
          if (!trab) return
          const monto = servicio.tarifaReferencia.monto ?? 50000
          try {
            const c = await crearContratacion({
              tipo: 'servicio',
              cliente_id: user.id,
              ofertante_id: trab.id,
              servicio_id: servicio.id,
              fecha_inicio: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
              monto,
              estado: 'solicitada',
              descripcion_trabajo: descripcion,
            })
            setOpenContratar(false)
            nav(`/panel/contratacion/${c.id}`)
          } catch (e) {
            console.error(e)
            alert('No se pudo crear la solicitud. Intenta de nuevo.')
          }
        }}
      />
    </div>
  )
}

function ContratarModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (descripcion: string) => void
}) {
  const [desc, setDesc] = useState('')
  return (
    <Modal open={open} onClose={onClose} title="Solicitar contratación" size="md">
      <p className="text-sm text-ink-500 mb-4">
        Cuéntale al maestro qué trabajo necesitas. Te enviará una cotización antes de cualquier pago.
      </p>
      <Textarea
        label="Descripción del trabajo"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Ej: se filtra agua debajo del lavamanos del baño principal…"
      />
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="ember" size="md" disabled={desc.length < 12} onClick={() => onSubmit(desc)}>
          Enviar solicitud
        </Button>
      </div>
    </Modal>
  )
}
