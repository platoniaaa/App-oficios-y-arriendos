import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { PriceTag } from '@/components/ui/PriceTag'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { CheckCircle2, MapPin, Truck, ShieldCheck, MessageCircle } from 'lucide-react'
import { formatCLP } from '@/lib/format'
import { useAuth } from '@/stores/useAuth'
import { crearContratacion } from '@/lib/queries/contrataciones'
import { useChat } from '@/stores/useChat'
import { fees } from '@/config/brand'
import { getHerramienta } from '@/lib/queries/herramientas'
import { getProfile } from '@/lib/queries/perfiles'
import { useFetch } from '@/hooks/useFetch'

export function HerramientaDetalle() {
  const { id } = useParams()
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const user = useAuth((s) => s.user())
  const nav = useNavigate()
  const startOrGet = useChat((s) => s.startOrGet)

  const { data, loading } = useFetch(async () => {
    if (!id) return null
    const h = await getHerramienta(id)
    if (!h) return null
    const owner = await getProfile(h.propietarioId)
    return { h, owner }
  }, [id])

  if (loading) {
    return <div className="container-page py-12 text-center text-ink-400">Cargando…</div>
  }
  if (!data) return <Navigate to="/buscar?tipo=herramientas" replace />
  const { h, owner } = data

  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-6 flex items-center gap-1 text-xs font-mono uppercase text-ink-400">
        <Link to="/buscar?tipo=herramientas" className="hover:text-navy">Herramientas</Link>
        <span>/</span>
        <span>{h.categoria}</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl border-2 border-navy bg-cream-deep">
            <img src={h.fotos[active]} alt={h.titulo} className="h-full w-full object-cover" />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {h.fotos.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={'h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 transition ' + (active === i ? 'border-navy' : 'border-transparent opacity-60 hover:opacity-100')}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          <div className="mt-10">
            <p className="font-mono text-xs uppercase text-ember">{h.categoria} · {h.subcategoria}</p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight mt-1">
              {h.titulo}
            </h1>
            <p className="mt-2 text-ink-500">{h.marca} · {h.modelo}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="navy">{h.estado}</Badge>
              {h.requiereEntrega && (
                <Badge tone="moss" icon={<Truck className="h-3 w-3" />}>
                  Delivery disponible
                </Badge>
              )}
              <Badge tone="cream">Retiro: {h.retiro.replace('_', ' ')}</Badge>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold mb-3">Descripción</h2>
            <p className="text-ink-500 whitespace-pre-line">{h.descripcion}</p>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold mb-3">Tarifas</h2>
            <div className="grid grid-cols-3 gap-3">
              {h.tarifa.porHora !== undefined && (
                <div className="ticket-sm p-4">
                  <p className="font-mono text-[10px] uppercase text-ink-400">Hora</p>
                  <p className="font-display text-xl">{formatCLP(h.tarifa.porHora)}</p>
                </div>
              )}
              {h.tarifa.porDia !== undefined && (
                <div className="ticket-sm p-4">
                  <p className="font-mono text-[10px] uppercase text-ink-400">Día</p>
                  <p className="font-display text-xl">{formatCLP(h.tarifa.porDia)}</p>
                </div>
              )}
              {h.tarifa.porSemana !== undefined && (
                <div className="ticket-sm p-4">
                  <p className="font-mono text-[10px] uppercase text-ink-400">Semana</p>
                  <p className="font-display text-xl">{formatCLP(h.tarifa.porSemana)}</p>
                </div>
              )}
            </div>
            <p className="mt-3 text-sm text-ink-500">
              Depósito en garantía: <strong>{formatCLP(h.depositoGarantia)}</strong> (se libera al devolver el equipo).
            </p>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl font-semibold mb-3">Disponibilidad</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {h.disponibilidad.map((d, i) => (
                <li key={i} className="flex items-center gap-2 rounded-xl border border-navy/10 bg-paper p-3">
                  <CheckCircle2 className="h-4 w-4 text-moss" />
                  <span className="text-sm">{d.desde} → {d.hasta}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 self-start space-y-5">
          <div className="ticket p-5">
            <p className="font-mono text-xs uppercase text-ink-400">Precio por día</p>
            <PriceTag value={h.tarifa.porDia ?? h.tarifa.porHora ?? h.tarifa.porSemana} unit="día" size="lg" />
            <StarRating value={h.calificacion} count={h.totalArriendos} />
            <p className="mt-3 text-sm text-ink-500 flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {h.comunaUbicacion}
            </p>
            <Button variant="ember" size="lg" className="mt-4 w-full" onClick={() => setOpen(true)}>
              Solicitar arriendo
            </Button>
            <Button
              variant="outline"
              size="md"
              className="mt-2 w-full"
              onClick={() => {
                if (!user) return nav('/login')
                if (!owner) return
                const conv = startOrGet(user.id, owner.id)
                nav(`/panel/chats/${conv.id}`)
              }}
            >
              <MessageCircle className="h-4 w-4" /> Enviar mensaje
            </Button>
            <div className="mt-4 rule-dashed" />
            <div className="mt-4 flex items-center gap-2 text-sm text-moss">
              <ShieldCheck className="h-4 w-4" /> Depósito resguardado en escrow
            </div>
          </div>

          <Link to={`/perfil/${owner?.id}`} className="card flex items-center gap-3 p-4 hover:border-navy/30">
            <Avatar src={owner?.fotoPerfil} name={owner?.nombre} size="md" />
            <div>
              <p className="font-semibold">{owner?.nombre}</p>
              <StarRating value={owner?.calificacionPromedio ?? 0} count={owner?.totalResenas} size="sm" />
              <p className="text-xs text-ink-400 mt-1">Miembro desde {owner?.fechaRegistro?.slice(0, 4)}</p>
            </div>
          </Link>
        </aside>
      </div>

      <SolicitarArriendoModal
        open={open}
        onClose={() => setOpen(false)}
        precioDia={h.tarifa.porDia ?? 0}
        deposito={h.depositoGarantia}
        onConfirm={async (dias, desde) => {
          if (!user) return nav('/login')
          if (!owner) return
          const monto = (h.tarifa.porDia ?? 0) * dias
          const fechaFin = new Date(new Date(desde).getTime() + dias * 86400000).toISOString()
          try {
            const c = await crearContratacion({
              tipo: 'arriendo',
              cliente_id: user.id,
              ofertante_id: owner.id,
              herramienta_id: h.id,
              fecha_inicio: desde,
              fecha_fin: fechaFin,
              monto,
              deposito: h.depositoGarantia,
              estado: 'aceptada_cliente',
            })
            setOpen(false)
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

function SolicitarArriendoModal({
  open,
  onClose,
  precioDia,
  deposito,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  precioDia: number
  deposito: number
  onConfirm: (dias: number, desde: string) => void
}) {
  const [desde, setDesde] = useState(new Date().toISOString().slice(0, 10))
  const [dias, setDias] = useState(2)
  const subtotal = precioDia * dias
  const comision = Math.round(subtotal * fees.comisionPlataforma)
  const total = subtotal + comision + deposito
  const finISO = useMemo(
    () => new Date(new Date(desde).getTime() + dias * 86400000).toISOString().slice(0, 10),
    [desde, dias],
  )

  return (
    <Modal open={open} onClose={onClose} title="Reservar arriendo" size="md">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Desde"
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
        />
        <Input
          label="Días"
          type="number"
          min={1}
          value={dias}
          onChange={(e) => setDias(Math.max(1, Number(e.target.value)))}
        />
      </div>
      <p className="mt-1 text-xs text-ink-400">Retiro: {desde} · Devolución: {finISO}</p>

      <div className="mt-6 space-y-2 rounded-2xl border border-navy/15 bg-cream-soft p-4 text-sm">
        <Row label={`Arriendo ${dias} día${dias > 1 ? 's' : ''}`} value={formatCLP(subtotal)} />
        <Row label={`Comisión plataforma (${Math.round(fees.comisionPlataforma * 100)}%)`} value={formatCLP(comision)} />
        <Row label="Depósito en garantía" value={formatCLP(deposito)} subtle />
        <div className="rule-dashed" />
        <Row label="Total a pagar al escrow" value={formatCLP(total)} strong />
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="ember" size="md" onClick={() => onConfirm(dias, desde)}>
          Confirmar reserva
        </Button>
      </div>
    </Modal>
  )
}

function Row({ label, value, subtle, strong }: { label: string; value: string; subtle?: boolean; strong?: boolean }) {
  return (
    <div
      className={'flex justify-between ' + (subtle ? 'text-ink-400' : strong ? 'font-bold text-navy' : 'text-ink-600')}
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}
