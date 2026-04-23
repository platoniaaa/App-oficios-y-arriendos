import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useAuth } from '@/stores/useAuth'
import { useContrataciones } from '@/stores/useContrataciones'
import { useResenas } from '@/stores/useResenas'
import { resumenFinanciero, ingresoPorMes } from '@/mocks/finanzas'
import { servicios } from '@/mocks/servicios'
import { usersById } from '@/mocks/users'
import { KpiCard } from '@/components/feature/KpiCard'
import { RevenueChart } from '@/components/feature/RevenueChart'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { formatCLP, formatRelative, formatDate } from '@/lib/format'
import {
  Wallet,
  ShieldCheck,
  Inbox,
  Hammer,
  Star,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Calendar,
} from 'lucide-react'

export function PrestadorDashboard() {
  const user = useAuth((s) => s.user())!
  const fin = resumenFinanciero(user.id)
  const chartData = ingresoPorMes(user.id)
  const contrs = useContrataciones(
    useShallow((s) => s.items.filter((c) => c.ofertanteId === user.id && c.tipo === 'servicio')),
  )
  const resenas = useResenas(useShallow((s) => s.paraUsuario(user.id).slice(0, 3)))

  const nuevas = contrs.filter((c) => c.estado === 'solicitada').length
  const enEjecucion = contrs.filter((c) => c.estado === 'en_ejecucion' || c.estado === 'pago_en_escrow').length
  const proximos = contrs
    .filter((c) => ['pago_en_escrow', 'en_ejecucion', 'aceptada_cliente'].includes(c.estado))
    .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
    .slice(0, 4)

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase text-ember-600">Panel del prestador</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Hola, {user.nombre.split(' ')[0]}
          </h1>
          <p className="text-sm text-ink-500 mt-1">Este es el estado de tu negocio esta semana.</p>
        </div>
        <Link to="/panel/publicar/servicio" className="btn-ember btn-md">
          Publicar nuevo servicio
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Ingresos del mes" value={formatCLP(fin.ingresoMes)} icon={<Wallet className="h-4 w-4" />} trend={{ dir: 'up', label: '+12%' }} />
        <KpiCard label="En escrow" value={formatCLP(fin.enEscrow)} tone="ember" icon={<ShieldCheck className="h-4 w-4" />} hint="pago protegido" />
        <KpiCard label="Solicitudes nuevas" value={nuevas} icon={<Inbox className="h-4 w-4" />} hint="esperando cotización" />
        <KpiCard label="En ejecución" value={enEjecucion} icon={<Hammer className="h-4 w-4" />} />
        <KpiCard label="Calificación" value={user.calificacionPromedio.toFixed(1)} icon={<Star className="h-4 w-4" />} hint={`${user.totalResenas} reseñas`} />
        <KpiCard label="Respuesta" value={`${user.respuestaPromedioHrs ?? '—'}h`} icon={<Clock className="h-4 w-4" />} hint={`${Math.round((user.tasaRespuesta ?? 0) * 100)}% respondidas`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase text-ink-400">Ingresos últimos 6 meses</p>
              <p className="font-display text-2xl font-semibold">{formatCLP(fin.ingresoTotal)}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-moss">
              <TrendingUp className="h-3 w-3" /> Crecimiento sostenido
            </span>
          </div>
          <RevenueChart data={chartData} />
        </div>

        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase text-ink-400">
            <Calendar className="h-3.5 w-3.5" /> Próximos trabajos
          </div>
          {proximos.length === 0 ? (
            <p className="text-sm text-ink-400 italic">Nada agendado por ahora.</p>
          ) : (
            <ul className="space-y-3">
              {proximos.map((c) => {
                const cliente = usersById[c.clienteId]
                const oficio = servicios.find((s) => s.id === c.itemId)?.oficio
                return (
                  <li key={c.id}>
                    <Link to={`/panel/contratacion/${c.id}`} className="flex items-start gap-3 rounded-xl p-2 hover:bg-ink-100">
                      <Avatar src={cliente?.fotoPerfil} name={cliente?.nombre} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{oficio}</p>
                        <p className="text-[11px] text-ink-400">
                          {cliente?.nombre} · {formatDate(c.fechaInicio)}
                        </p>
                      </div>
                      <span className="font-mono text-xs tabular-nums">{formatCLP(c.total)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="font-display text-xl font-semibold mb-3">Últimas reseñas</h2>
          {resenas.length === 0 ? (
            <p className="text-sm text-ink-400">Aún no tienes reseñas.</p>
          ) : (
            <ul className="space-y-3">
              {resenas.map((r) => {
                const autor = usersById[r.autorId]
                return (
                  <li key={r.id} className="card p-4">
                    <div className="flex items-start gap-3">
                      <Avatar src={autor?.fotoPerfil} name={autor?.nombre} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{autor?.nombre}</p>
                          <StarRating value={r.estrellas} showNumber={false} size="sm" />
                        </div>
                        <p className="text-xs text-ink-400">{formatRelative(r.fecha)}</p>
                        <p className="mt-1 text-sm text-ink-500 line-clamp-2">{r.comentario}</p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <Link to="/panel/prestador/resenas" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold hover:text-ember">
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Tips y alertas</h2>
          <Tip tono="moss" titulo="Mantén tu agenda actualizada" texto="Los clientes prefieren profesionales con horario visible. Revisa tu disponibilidad esta semana." />
          <Tip tono="ember" titulo="Responde más rápido para subir en el ranking" texto={`Tu tiempo promedio es ${user.respuestaPromedioHrs ?? '—'}h. Bajar a 1h te posicionaría entre los top 10%.`} />
          <Tip tono="navy" titulo="Cotizaciones con recargo nocturno" texto="Activa recargo automático de 20% en horarios especiales para urgencias." />
        </div>
      </section>
    </div>
  )
}

function Tip({ tono, titulo, texto }: { tono: 'moss' | 'ember' | 'navy'; titulo: string; texto: string }) {
  const bg = tono === 'moss' ? 'bg-moss/10 border-moss/30 text-moss' : tono === 'ember' ? 'bg-ember/10 border-ember/30 text-ember-600' : 'bg-navy/5 border-navy/15 text-navy'
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <p className="flex items-center gap-2 font-semibold">
        <AlertTriangle className="h-4 w-4" /> {titulo}
      </p>
      <p className="mt-1 text-sm text-ink-500">{texto}</p>
    </div>
  )
}
