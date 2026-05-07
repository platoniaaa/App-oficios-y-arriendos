import { PanelRolLayout } from '@/components/layout/PanelRolLayout'
import { LayoutDashboard, Wrench, Inbox, Calendar, Wallet, Star, UserCog, Settings } from 'lucide-react'
import { useAuth } from '@/stores/useAuth'
import { listContratacionesDeUsuario } from '@/lib/queries/contrataciones'
import { useFetch } from '@/hooks/useFetch'

export function PrestadorLayout() {
  const user = useAuth((s) => s.user())
  const { data: contrs } = useFetch(
    () => (user ? listContratacionesDeUsuario(user.id) : Promise.resolve([])),
    [user?.id],
  )
  const nuevas = (contrs ?? []).filter(
    (c) => user && c.ofertanteId === user.id && c.tipo === 'servicio' && c.estado === 'solicitada',
  ).length

  return (
    <PanelRolLayout
      rol="trabajador"
      titulo="Panel del prestador"
      subtitulo="Cuadrilla · modo trabajador"
      links={[
        { to: '/panel/prestador', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { to: '/panel/prestador/servicios', label: 'Mis servicios', icon: Wrench },
        { to: '/panel/prestador/solicitudes', label: 'Solicitudes', icon: Inbox, badge: nuevas },
        { to: '/panel/prestador/agenda', label: 'Agenda', icon: Calendar },
        { to: '/panel/prestador/ingresos', label: 'Ingresos', icon: Wallet },
        { to: '/panel/prestador/resenas', label: 'Reseñas', icon: Star },
        { to: '/panel/prestador/perfil', label: 'Perfil', icon: UserCog },
        { to: '/panel/prestador/configuracion', label: 'Configuración', icon: Settings },
      ]}
    />
  )
}
