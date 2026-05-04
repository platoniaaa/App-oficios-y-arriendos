import { NavLink } from 'react-router-dom'
import { Home, Search, Sparkles, MessageCircle, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/stores/useAuth'
import { useChat } from '@/stores/useChat'
import { useShallow } from 'zustand/react/shallow'

const items = [
  { to: '/', label: 'Inicio', icon: Home, exact: true },
  { to: '/buscar', label: 'Buscar', icon: Search },
  { to: '/asistente', label: 'Asistente', icon: Sparkles, accent: true },
  { to: '/panel/chats', label: 'Chats', icon: MessageCircle, requireAuth: true },
  { to: '/panel', label: 'Panel', icon: LayoutDashboard, requireAuth: true },
]

export function BottomNav() {
  const user = useAuth((s) => s.user())
  const unread = useChat(
    useShallow((s) =>
      user ? s.conversaciones.filter((c) => c.participantes.includes(user.id)).reduce((a, c) => a + (c.noLeidos ?? 0), 0) : 0,
    ),
  )

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-navy bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map((it) => {
          const Icon = it.icon
          const to = 'requireAuth' in it && it.requireAuth && !user ? '/login' : it.to
          return (
            <li key={it.to} className="relative">
              <NavLink
                to={to}
                end={'exact' in it ? it.exact : false}
                className={({ isActive }) =>
                  cn(
                    'flex h-16 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    isActive ? 'text-navy' : 'text-ink-400',
                  )
                }
              >
                <span
                  className={cn(
                    'relative rounded-full px-3 py-1',
                    'accent' in it && it.accent && 'bg-ember text-cream shadow-ticket-sm',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {it.label === 'Chats' && unread > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-bold text-cream">
                      {unread}
                    </span>
                  )}
                </span>
                <span>{it.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
