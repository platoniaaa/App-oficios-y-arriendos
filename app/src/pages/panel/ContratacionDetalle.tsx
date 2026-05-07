import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { TimelineEscrow } from '@/components/ui/TimelineEscrow'
import { EstadoLabel } from '@/components/feature/EstadoContratacionLabel'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Input'
import { InteractiveStars } from '@/components/ui/StarRating'
import { Card } from '@/components/ui/Card'
import { formatCLP, formatDate } from '@/lib/format'
import { fees } from '@/config/brand'
import type { EstadoContratacion } from '@/types'
import { AlertTriangle, MessageCircle, FileText } from 'lucide-react'
import { useChat } from '@/stores/useChat'
import { useNotificaciones } from '@/stores/useNotificaciones'
import {
  getContratacion,
  actualizarEstadoContratacion,
} from '@/lib/queries/contrataciones'
import { crearResena } from '@/lib/queries/resenas'
import { getProfile } from '@/lib/queries/perfiles'
import { getServicio } from '@/lib/queries/servicios'
import { getHerramienta } from '@/lib/queries/herramientas'
import { useFetch } from '@/hooks/useFetch'

export function ContratacionDetalle() {
  const { id } = useParams()
  const user = useAuth((s) => s.user())!
  const startOrGet = useChat((s) => s.startOrGet)
  const nav = useNavigate()
  const notifPush = useNotificaciones((s) => s.push)
  const [resenaOpen, setResenaOpen] = useState(false)

  const { data, loading, refetch } = useFetch(async () => {
    if (!id) return null
    const c = await getContratacion(id)
    if (!c) return null
    const otroId = c.clienteId === user.id ? c.ofertanteId : c.clienteId
    const [contraparte, item] = await Promise.all([
      getProfile(otroId),
      c.tipo === 'servicio' ? getServicio(c.itemId) : getHerramienta(c.itemId),
    ])
    return { c, contraparte, item }
  }, [id, user.id])

  if (loading) {
    return <p className="text-sm text-ink-400 py-8 text-center">Cargando…</p>
  }
  if (!data || !data.c) {
    return <p className="text-sm text-ink-400">Contratación no encontrada.</p>
  }

  const c = data.c
  const contraparte = data.contraparte
  const item = data.item
  const esCliente = c.clienteId === user.id
  const itemTitle =
    item && c.tipo === 'servicio'
      ? (item as { oficio: string }).oficio
      : item
        ? (item as { titulo: string }).titulo
        : undefined
  const itemLink = c.tipo === 'servicio' ? `/servicio/${c.itemId}` : `/herramienta/${c.itemId}`

  async function updateEstado(nuevo: EstadoContratacion) {
    if (!c) return
    await actualizarEstadoContratacion(c.id, nuevo)
    refetch()
  }
  async function addResena(input: {
    contratacionId: string
    autorId: string
    destinoId: string
    estrellas: number
    comentario: string
    recomienda: boolean
  }) {
    await crearResena({
      contratacion_id: input.contratacionId,
      autor_id: input.autorId,
      destino_id: input.destinoId,
      estrellas: input.estrellas,
      comentario: input.comentario,
      recomienda: input.recomienda,
    })
  }

  function advanceTo(next: EstadoContratacion) {
    void updateEstado(next)
  }

  const acciones: { label: string; next: EstadoContratacion; variant?: 'ember' | 'primary' | 'outline' | 'ghost' }[] = []
  if (esCliente) {
    if (c.estado === 'solicitada') acciones.push({ label: 'Cancelar solicitud', next: 'cancelada', variant: 'outline' })
    if (c.estado === 'cotizada') {
      acciones.push({ label: 'Aceptar y pagar al escrow', next: 'pago_en_escrow', variant: 'ember' })
      acciones.push({ label: 'Cancelar', next: 'cancelada', variant: 'outline' })
    }
    if (c.estado === 'aceptada_cliente') acciones.push({ label: 'Pagar y reservar en escrow', next: 'pago_en_escrow', variant: 'ember' })
    if (c.estado === 'finalizada_pendiente_aprobacion') {
      acciones.push({ label: 'Aprobar y liberar pago', next: 'liberado', variant: 'ember' })
      acciones.push({ label: 'Reportar problema', next: 'en_disputa', variant: 'outline' })
    }
  } else {
    if (c.estado === 'solicitada') acciones.push({ label: 'Enviar cotización', next: 'cotizada', variant: 'primary' })
    if (c.estado === 'pago_en_escrow') acciones.push({ label: 'Iniciar trabajo', next: 'en_ejecucion', variant: 'primary' })
    if (c.estado === 'en_ejecucion') acciones.push({ label: 'Marcar como finalizado', next: 'finalizada_pendiente_aprobacion', variant: 'ember' })
  }
  const puedeResena = c.estado === 'liberado'

  return (
    <div className="space-y-8">
      <header>
        <Link to="/panel/contrataciones" className="font-mono text-xs uppercase text-ink-400 hover:text-navy">
          ← Volver a contrataciones
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase text-ember">
              {c.tipo === 'servicio' ? 'Servicio' : 'Arriendo'} · #{c.id}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold">{itemTitle ?? 'Contratación'}</h1>
          </div>
          <EstadoLabel estado={c.estado} />
        </div>
      </header>

      <Card variant="ticket" className="p-6">
        <p className="font-mono text-xs uppercase text-ink-400 mb-4">Línea de tiempo (escrow)</p>
        <TimelineEscrow estado={c.estado} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar src={contraparte?.fotoPerfil} name={contraparte?.nombre} size="md" />
                <div>
                  <p className="font-mono text-[10px] uppercase text-ink-400">
                    {esCliente ? 'Prestador' : 'Cliente'}
                  </p>
                  <p className="font-semibold">{contraparte?.nombre}</p>
                  <Link to={`/perfil/${contraparte?.id}`} className="text-xs text-ember hover:underline">
                    Ver perfil
                  </Link>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!contraparte) return
                  const conv = startOrGet(user.id, contraparte.id)
                  nav(`/panel/chats/${conv.id}`)
                }}
              >
                <MessageCircle className="h-4 w-4" /> Abrir chat
              </Button>
            </div>
          </Card>

          {c.descripcionTrabajo && (
            <Card>
              <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" /> Descripción del trabajo
              </h3>
              <p className="text-sm text-ink-500 whitespace-pre-line">{c.descripcionTrabajo}</p>
            </Card>
          )}

          <Card>
            <h3 className="font-display text-lg font-semibold mb-3">Historial</h3>
            <ol className="space-y-2">
              {c.historialEstados.map((h, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm border-b border-navy/5 py-2 last:border-0">
                  <EstadoLabel estado={h.estado} />
                  <span className="text-xs text-ink-400 font-mono">{formatDate(h.fecha)}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card variant="dark">
            <p className="font-mono text-xs uppercase text-cream/60">Acciones</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {acciones.length === 0 ? (
                <p className="text-sm text-cream/70">No hay acciones disponibles en este estado.</p>
              ) : (
                acciones.map((a) => (
                  <Button
                    key={a.label}
                    variant={a.variant ?? 'primary'}
                    size="md"
                    onClick={() => {
                      advanceTo(a.next)
                      if (a.next === 'pago_en_escrow')
                        notifPush({
                          usuarioId: c.ofertanteId,
                          tipo: 'escrow_pagado',
                          titulo: 'Pago recibido en escrow',
                          texto: 'Ya puedes iniciar el trabajo.',
                          link: `/panel/contratacion/${c.id}`,
                        })
                      if (a.next === 'liberado')
                        notifPush({
                          usuarioId: c.ofertanteId,
                          tipo: 'pago_liberado',
                          titulo: 'Pago liberado',
                          texto: 'El cliente aprobó el trabajo.',
                          link: `/panel/contratacion/${c.id}`,
                        })
                    }}
                  >
                    {a.label}
                  </Button>
                ))
              )}
              {puedeResena && (
                <Button variant="ember" size="md" onClick={() => setResenaOpen(true)}>
                  Dejar reseña
                </Button>
              )}
            </div>
            {c.estado === 'en_disputa' && (
              <p className="mt-3 flex items-center gap-2 text-sm text-ember-300">
                <AlertTriangle className="h-4 w-4" /> Nuestro equipo ya fue notificado y tomará contacto en menos de 24h.
              </p>
            )}
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 self-start space-y-4">
          <Card variant="ticket">
            <p className="font-mono text-xs uppercase text-ink-400">Detalle de costos</p>
            <Row label="Monto base" value={formatCLP(c.monto)} />
            <Row label={`Comisión plataforma (${Math.round(fees.comisionPlataforma * 100)}%)`} value={formatCLP(c.comision)} />
            {c.deposito ? <Row label="Depósito en garantía" value={formatCLP(c.deposito)} subtle /> : null}
            <div className="rule-dashed my-2" />
            <Row label="Total" value={formatCLP(c.total)} strong />
            <p className="mt-3 text-xs text-ink-500">
              Item: <Link to={itemLink} className="underline">{itemTitle}</Link>
            </p>
          </Card>

          <Card>
            <p className="font-mono text-xs uppercase text-ink-400">Fechas</p>
            <Row label="Solicitud" value={formatDate(c.fechaSolicitud)} />
            <Row label="Inicio" value={formatDate(c.fechaInicio)} />
            {c.fechaFin && <Row label="Fin" value={formatDate(c.fechaFin)} />}
          </Card>
        </aside>
      </div>

      {puedeResena && (
        <DejarResenaModal
          open={resenaOpen}
          onClose={() => setResenaOpen(false)}
          onSubmit={(estrellas, texto, recomienda) => {
            addResena({
              contratacionId: c.id,
              autorId: user.id,
              destinoId: contraparte?.id ?? c.ofertanteId,
              estrellas,
              comentario: texto,
              recomienda,
            })
            notifPush({
              usuarioId: contraparte?.id ?? c.ofertanteId,
              tipo: 'resena_recibida',
              titulo: 'Nueva reseña',
              texto: 'Te dejaron una reseña por la contratación finalizada.',
              link: `/perfil/${contraparte?.id ?? c.ofertanteId}`,
            })
            setResenaOpen(false)
          }}
        />
      )}
    </div>
  )
}

function Row({ label, value, subtle, strong }: { label: string; value: string; subtle?: boolean; strong?: boolean }) {
  return (
    <div className={'mt-1.5 flex justify-between text-sm ' + (subtle ? 'text-ink-400' : strong ? 'font-bold text-navy' : 'text-ink-600')}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}

function DejarResenaModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (estrellas: number, texto: string, recomienda: boolean) => void
}) {
  const [estrellas, setEstrellas] = useState(5)
  const [texto, setTexto] = useState('')
  const [recomienda, setRecomienda] = useState(true)

  return (
    <Modal open={open} onClose={onClose} title="Dejar reseña" size="md">
      <div className="space-y-5">
        <div>
          <p className="label-base">Calificación</p>
          <InteractiveStars value={estrellas} onChange={setEstrellas} />
        </div>
        <Textarea
          label="Comentario"
          value={texto}
          onChange={(e) => setTexto(e.target.value.slice(0, 500))}
          placeholder="Cuéntanos cómo fue la experiencia…"
          hint={`${texto.length}/500`}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-navy" checked={recomienda} onChange={(e) => setRecomienda(e.target.checked)} />
          Recomiendo a este profesional
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="ember" size="md" disabled={texto.length < 10} onClick={() => onSubmit(estrellas, texto, recomienda)}>
            Enviar reseña
          </Button>
        </div>
      </div>
    </Modal>
  )
}
