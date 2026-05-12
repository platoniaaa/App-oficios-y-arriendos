import { useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { RolSwitcher } from '@/components/feature/RolSwitcher'
import { cn } from '@/lib/cn'
import type { ComponentType } from 'react'
import { Menu, X } from 'lucide-react'
import type { Rol } from '@/types'

export interface NavLinkItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  exact?: boolean
  badge?: number
}

interface Props {
  rol: Extract<Rol, 'trabajador' | 'arrendador'>
  titulo: string
  subtitulo: string
  links: NavLinkItem[]
}

export function PanelRolLayout({ rol, titulo, subtitulo, links }: Props) {
  const user = useAuth((s) => s.user())
  const [open, setOpen] = useState(false)
  const loc = useLocation()

  if (!user) return <Navigate to="/login" replace />
  if (!user.roles.includes(rol)) {
    // si entra por url a un panel que no le corresponde, redirigimos al hub
    return <Navigate to="/panel" replace />
  }

  function SideContent() {
    return (
      <div className="flex h-full flex-col">
        <div className="px-4 pt-5 pb-4 border-b border-ink-100 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar src={user!.fotoPerfil} name={user!.nombre} size="md" />
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-semibold">{user!.nombre}</p>
              <p className="truncate text-xs text-ink-400">{user!.roles.join(' · ')}</p>
            </div>
          </div>
          <RolSwitcher user={user!} />
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {links.map((l) => {
            const Icon = l.icon
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.exact}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                    isActive ? 'bg-navy text-white' : 'text-ink-600 hover:bg-ink-100',
                  )
                }
              >
                <span className="inline-flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  {l.label}
                </span>
                {l.badge !== undefined && l.badge > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1.5 text-[10px] font-bold text-white">
                    {l.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>
        <div className="border-t border-ink-100 p-4 text-[10px] text-ink-400">
          {subtitulo}
        </div>
      </div>
    )
  }

  const current = links.find((l) => (l.exact ? loc.pathname === l.to : loc.pathname.startsWith(l.to)))

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-ink-200 bg-white">
        <div className="w-full">
          <SideContent />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 min-w-0">
        <div className="lg:hidden flex items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full border border-ink-200 p-2 hover:bg-ink-100"
            aria-label="Abrir menú"
          >
            <Menu className="h-4 w-4" />
          </button>
          <p className="font-display text-lg font-semibold">{current?.label ?? titulo}</p>
          <Avatar src={user.fotoPerfil} name={user.nombre} size="sm" />
        </div>
        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10 max-w-[1200px] mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85%] border-r border-ink-200 bg-white">
            <div className="absolute right-2 top-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 hover:bg-ink-100"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SideContent />
          </aside>
        </div>
      )}
    </div>
  )
}
