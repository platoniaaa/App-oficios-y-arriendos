import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useAuth } from '@/stores/useAuth'
import { useModo } from '@/stores/useModo'
import { useContrataciones } from '@/stores/useContrataciones'
import { useChat } from '@/stores/useChat'
import { useNotificaciones } from '@/stores/useNotificaciones'
import { useResenas } from '@/stores/useResenas'
import { Avatar } from '@/components/ui/Avatar'
import { VerificationBadge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { PriceTag } from '@/components/ui/PriceTag'
import { EmptyState } from '@/components/ui/EmptyState'
import { EstadoLabel } from '@/components/feature/EstadoContratacionLabel'
import { formatRelative } from '@/lib/format'
import { ArrowRight, Plus, Sparkles } from 'lucide-react'
import { servicios } from '@/mocks/servicios'
import { herramientas } from '@/mocks/herramientas'
import { usersById } from '@/mocks/users'

export function PanelHome() {
  const user = useAuth((s) => s.user())!
  const contrataciones = useContrataciones(
    useShallow((s) => s.items.filter((c) => c.clienteId === user.id || c.ofertanteId === user.id)),
  )
  const conversaciones = useChat(
    useShallow((s) => s.conversaciones.filter((c) => c.participantes.includes(user.id))),
  )
  const notif = useNotificaciones(
    useShallow((s) => s.items.filter((n) => n.usuarioId === user.id).slice(0, 5)),
  )
  const resenasPara = useResenas(useShallow((s) => s.paraUsuario(user.id)))

  const modo = useModo((s) => s.modo)
  const isProf = modo === 'profesional'
  const isTrabajador = user.roles.includes('trabajador')
  const isArrendador = user.roles.includes('arrendador') && isProf

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase text-ember">Panel</p>
          <h1 className="font-display text-4xl font-semibold">Hola, {user.nombre.split(' ')[0]} 👋</h1>
          <p className="text-ink-500 mt-1">Este es el resumen de tu actividad en Cuadrilla.</p>
        </div>
        <Link to="/asistente" className="btn-ember btn-md">
          <Sparkles className="h-4 w-4" /> Abrir asistente
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Contrataciones activas"
          value={contrataciones.filter((c) => !['liberado', 'cancelada'].includes(c.estado)).length}
          to="/panel/contrataciones"
        />
        <StatCard label="Conversaciones" value={conversaciones.length} to="/panel/chats" />
        <StatCard label="Reseñas recibidas" value={resenasPara.length} to="/panel/resenas" />
        <StatCard
          label="Notificaciones"
          value={notif.filter((n) => !n.leida).length}
          to="/panel/notificaciones"
        />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold">Últimas contrataciones</h2>
          <Link to="/panel/contrataciones" className="text-sm font-semibold hover:text-ember">
            Ver todas <ArrowRight className="inline h-3 w-3" />
          </Link>
        </div>
        {contrataciones.length === 0 ? (
          <EmptyState
            title="Aún no tienes contrataciones"
            description="Cuando contrates un servicio o publiques una herramienta, verás el seguimiento acá."
            action={
              <Link to="/buscar/servicios" className="btn-primary btn-md mt-3">
                Buscar maestros
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {contrataciones.slice(0, 5).map((c) => {
              const otro = usersById[c.clienteId === user.id ? c.ofertanteId : c.clienteId]
              const item =
                c.tipo === 'servicio'
                  ? servicios.find((s) => s.id === c.itemId)?.oficio
                  : herramientas.find((h) => h.id === c.itemId)?.titulo
              return (
                <li key={c.id}>
                  <Link
                    to={`/panel/contratacion/${c.id}`}
                    className="card flex items-center gap-4 p-4 hover:border-navy/30"
                  >
                    <Avatar src={otro?.fotoPerfil} name={otro?.nombre} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{item ?? 'Contratación'}</p>
                      <p className="text-xs text-ink-400">
                        {c.tipo} · con {otro?.nombre} · {formatRelative(c.fechaSolicitud)}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <EstadoLabel estado={c.estado} />
                    </div>
                    <PriceTag value={c.total} size="sm" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {isTrabajador && (
          <Link
            to="/panel/prestador"
            className="ticket group flex items-center justify-between gap-4 p-6 hover:bg-ink-50"
          >
            <div>
              <p className="font-mono text-xs uppercase text-ember">Modo trabajador</p>
              <h3 className="font-display text-2xl font-semibold mt-1">Ir al panel de prestador</h3>
              <p className="text-sm text-ink-500 mt-1">Agenda, solicitudes, ingresos y tus reseñas.</p>
            </div>
            <Plus className="h-10 w-10 transition group-hover:rotate-90" />
          </Link>
        )}
        {isArrendador && (
          <Link
            to="/panel/arrendador"
            className="ticket group flex items-center justify-between gap-4 p-6 hover:bg-ink-50"
          >
            <div>
              <p className="font-mono text-xs uppercase text-ember">Modo arrendador</p>
              <h3 className="font-display text-2xl font-semibold mt-1">Ir al panel de arrendador</h3>
              <p className="text-sm text-ink-500 mt-1">Inventario, calendario, arriendos e ingresos.</p>
            </div>
            <Plus className="h-10 w-10 transition group-hover:rotate-90" />
          </Link>
        )}
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold mb-4">Verificaciones</h2>
          <div className="card p-5 space-y-3">
            <VerificationBadge estado={user.verificacion.rut} label="RUT" />
            <VerificationBadge estado={user.verificacion.cedula} label="Cédula" />
            <VerificationBadge estado={user.verificacion.antecedentes} label="Antecedentes" />
            <VerificationBadge estado={user.verificacion.certificaciones} label="Certificaciones" />
            <Link to="/panel/perfil" className="mt-2 block text-sm font-semibold hover:text-ember">
              Gestionar verificaciones →
            </Link>
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-semibold mb-4">Tu reputación</h2>
          <div className="card p-5 flex flex-col justify-center">
            <StarRating value={user.calificacionPromedio} count={user.totalResenas} size="lg" />
            <p className="text-sm text-ink-500 mt-3">
              Basada en {user.totalResenas} reseña{user.totalResenas === 1 ? '' : 's'} de otros usuarios.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link
      to={to}
      className="card group flex items-center justify-between gap-3 p-5 transition hover:border-navy/30"
    >
      <div>
        <p className="font-mono text-xs uppercase text-ink-400">{label}</p>
        <p className="font-display text-4xl font-semibold mt-1">{value}</p>
      </div>
      <ArrowRight className="h-5 w-5 translate-x-0 opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100" />
    </Link>
  )
}
