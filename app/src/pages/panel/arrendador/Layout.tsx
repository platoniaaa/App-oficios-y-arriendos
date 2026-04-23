import { PanelRolLayout } from '@/components/layout/PanelRolLayout'
import { LayoutDashboard, Package, Inbox, CalendarRange, Wallet, Star, UserCog, Settings } from 'lucide-react'
import { useAuth } from '@/stores/useAuth'
import { useContrataciones } from '@/stores/useContrataciones'

export function ArrendadorLayout() {
  const user = useAuth((s) => s.user())
  const nuevas = useContrataciones((s) =>
    user
      ? s.items.filter((c) => c.ofertanteId === user.id && c.tipo === 'arriendo' && c.estado === 'solicitada').length
      : 0,
  )

  return (
    <PanelRolLayout
      rol="arrendador"
      titulo="Panel del arrendador"
      subtitulo="Cuadrilla · modo arrendador"
      links={[
        { to: '/panel/arrendador', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { to: '/panel/arrendador/inventario', label: 'Mi inventario', icon: Package },
        { to: '/panel/arrendador/arriendos', label: 'Arriendos', icon: Inbox, badge: nuevas },
        { to: '/panel/arrendador/calendario', label: 'Calendario', icon: CalendarRange },
        { to: '/panel/arrendador/ingresos', label: 'Ingresos', icon: Wallet },
        { to: '/panel/arrendador/resenas', label: 'Reseñas', icon: Star },
        { to: '/panel/arrendador/perfil', label: 'Perfil', icon: UserCog },
        { to: '/panel/arrendador/configuracion', label: 'Configuración', icon: Settings },
      ]}
    />
  )
}
