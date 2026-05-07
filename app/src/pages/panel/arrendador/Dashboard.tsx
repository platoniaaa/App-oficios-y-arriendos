import { Link } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { listContratacionesDeUsuario } from '@/lib/queries/contrataciones'
import { listHerramientasDeUsuario } from '@/lib/queries/herramientas'
import { useFetch } from '@/hooks/useFetch'
import { resumenFinanciero, ingresoPorMes } from '@/mocks/finanzas'
import { usersById } from '@/mocks/users'
import { KpiCard } from '@/components/feature/KpiCard'
import { RevenueChart } from '@/components/feature/RevenueChart'
import { Avatar } from '@/components/ui/Avatar'
import { formatCLP, formatDate } from '@/lib/format'
import {
  Wallet,
  ShieldCheck,
  Inbox,
  Truck,
  Star,
  ArrowRight,
  PackageCheck,
  Wrench,
  AlertTriangle,
  Percent,
} from 'lucide-react'

export function ArrendadorDashboard() {
  const user = useAuth((s) => s.user())!
  const fin = resumenFinanciero(user.id)
  const chartData = ingresoPorMes(user.id)
  const { data: contrsData } = useFetch(
    () => listContratacionesDeUsuario(user.id),
    [user.id],
  )
  const contrs = (contrsData ?? []).filter(
    (c) => c.ofertanteId === user.id && c.tipo === 'arriendo',
  )
  const { data: invData } = useFetch(() => listHerramientasDeUsuario(user.id), [user.id])
  const inventario = invData ?? []

  const nuevas = contrs.filter((c) => c.estado === 'solicitada').length
  const activos = contrs.filter((c) => ['pago_en_escrow', 'en_ejecucion', 'finalizada_pendiente_aprobacion'].includes(c.estado)).length
  const arrendadasCount = inventario.filter((h) => h.estadoOperacional === 'arrendada').length
  const ocupacion = inventario.length === 0 ? 0 : Math.round((arrendadasCount / inventario.length) * 100)

  // Top 5 herramientas más arrendadas (históricamente)
  const topHerramientas = [...inventario]
    .sort((a, b) => b.totalArriendos - a.totalArriendos)
    .slice(0, 5)

  const proximasDevoluciones = contrs
    .filter((c) => ['en_ejecucion', 'finalizada_pendiente_aprobacion'].includes(c.estado) && c.fechaFin)
    .sort((a, b) => (a.fechaFin ?? '').localeCompare(b.fechaFin ?? ''))
    .slice(0, 4)

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase text-ember-600">Panel del arrendador</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Hola, {user.nombre.split(' ')[0]}
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {inventario.length} equipos en catálogo · {arrendadasCount} activos esta semana
          </p>
        </div>
        <Link to="/panel/publicar/herramienta" className="btn-ember btn-md">
          Publicar nueva herramienta
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Ingresos del mes" value={formatCLP(fin.ingresoMes)} icon={<Wallet className="h-4 w-4" />} />
        <KpiCard label="En escrow" value={formatCLP(fin.enEscrow)} tone="ember" icon={<ShieldCheck className="h-4 w-4" />} />
        <KpiCard label="Depósitos custodiados" value={formatCLP(fin.depositosCustodia)} tone="moss" icon={<ShieldCheck className="h-4 w-4" />} hint="respaldo de arriendos activos" />
        <KpiCard label="Solicitudes nuevas" value={nuevas} icon={<Inbox className="h-4 w-4" />} />
        <KpiCard label="Arriendos activos" value={activos} icon={<Truck className="h-4 w-4" />} />
        <KpiCard label="Ocupación inventario" value={`${ocupacion}%`} icon={<Percent className="h-4 w-4" />} hint={`${arrendadasCount} de ${inventario.length}`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase text-ink-400">Ingresos últimos 6 meses</p>
              <p className="font-display text-2xl font-semibold">{formatCLP(fin.ingresoTotal)}</p>
            </div>
            <Star className="h-5 w-5 text-ember" />
          </div>
          <RevenueChart data={chartData} color="#2563EB" />
        </div>

        <div className="card p-5">
          <p className="font-mono text-xs uppercase text-ink-400 mb-3">Top herramientas arrendadas</p>
          <ul className="space-y-2">
            {topHerramientas.map((h, i) => (
              <li key={h.id} className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold tabular-nums text-ink-400 w-4">
                  {i + 1}.
                </span>
                <img src={h.fotos[0]} alt="" className="h-10 w-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{h.titulo}</p>
                  <p className="text-[11px] text-ink-400">{h.totalArriendos} arriendos</p>
                </div>
                <span className="font-mono text-xs tabular-nums">{formatCLP(h.tarifa.porDia ?? 0)}/d</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
            <PackageCheck className="h-4 w-4" /> Próximas devoluciones
          </h2>
          {proximasDevoluciones.length === 0 ? (
            <p className="text-sm text-ink-400">Nada por devolver esta semana.</p>
          ) : (
            <ul className="space-y-3">
              {proximasDevoluciones.map((c) => {
                const cliente = usersById[c.clienteId]
                const tool = inventario.find((h) => h.id === c.itemId)
                return (
                  <li key={c.id}>
                    <Link to={`/panel/contratacion/${c.id}`} className="card flex items-center gap-3 p-3 hover:border-navy/30">
                      <img src={tool?.fotos[0]} alt="" className="h-12 w-16 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{tool?.titulo}</p>
                        <p className="text-[11px] text-ink-400">
                          Devuelve {formatDate(c.fechaFin)} · {cliente?.nombre}
                        </p>
                      </div>
                      <Avatar src={cliente?.fotoPerfil} name={cliente?.nombre} size="sm" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
          <Link to="/panel/arrendador/arriendos" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold hover:text-ember">
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Alertas de mantenimiento</h2>
          {inventario
            .filter((h) => h.estadoOperacional === 'mantenimiento')
            .map((h) => (
              <div key={h.id} className="rounded-xl border border-ember/30 bg-ember/10 p-4 text-ember-600">
                <p className="flex items-center gap-2 font-semibold">
                  <Wrench className="h-4 w-4" /> {h.titulo}
                </p>
                <p className="mt-1 text-sm text-ink-500">Equipo en mantenimiento preventivo. Revisa la fecha de retorno.</p>
              </div>
            ))}
          <div className="rounded-xl border border-moss/30 bg-moss/10 p-4 text-moss">
            <p className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" /> Ingresa tus equipos a la temporada alta
            </p>
            <p className="mt-1 text-sm text-ink-500">
              Diciembre tuvo {formatCLP(3825000)} en ingresos. Asegura tu inventario disponible.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
