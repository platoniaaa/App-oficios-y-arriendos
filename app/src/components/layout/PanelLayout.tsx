import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { LayoutDashboard, Briefcase, FileText, MessageCircle, Bell, Star, UserCog } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useNotifCount } from '@/hooks/useNotifCount'
import { RolSwitcher } from '@/components/feature/RolSwitcher'

const links = [
  { to: '/panel', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { to: '/panel/perfil', label: 'Mi cuenta', icon: UserCog },
  { to: '/panel/mis-publicaciones', label: 'Mis publicaciones', icon: Briefcase },
  { to: '/panel/contrataciones', label: 'Mis contrataciones', icon: FileText },
  { to: '/panel/chats', label: 'Chats', icon: MessageCircle },
  { to: '/panel/resenas', label: 'Reseñas', icon: Star },
  { to: '/panel/notificaciones', label: 'Notificaciones', icon: Bell },
]

export function PanelLayout() {
  const user = useAuth((s) => s.user())
  const noLeidas = useNotifCount(user?.id)
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="container-page py-8 md:py-12">
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <aside className="space-y-5">
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar src={user.fotoPerfil} name={user.nombre} size="md" />
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-semibold">{user.nombre}</p>
                <p className="text-xs text-ink-400">{user.roles.join(' · ')}</p>
              </div>
            </div>
            <RolSwitcher user={user} />
          </div>
          <nav className="rounded-2xl border border-navy/10 bg-paper p-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.exact}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
                    isActive ? 'bg-navy text-cream' : 'text-navy hover:bg-navy/5',
                  )
                }
              >
                <span className="inline-flex items-center gap-2">
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </span>
                {l.to === '/panel/notificaciones' && noLeidas > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1.5 text-[10px] font-bold text-cream">
                    {noLeidas}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>
        <section>
          <Outlet />
        </section>
      </div>
    </div>
  )
}
