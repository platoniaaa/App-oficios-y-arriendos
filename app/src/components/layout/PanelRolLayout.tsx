import { useState } from 'react'
import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { RolSwitcher } from '@/components/feature/RolSwitcher'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
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

export function PanelRolLayout({ rol, titulo, links }: Props) {
  const user = useAuth((s) => s.user())
  const [open, setOpen] = useState(false)

  if (!user) return <Navigate to="/login" replace />
  if (!user.roles.includes(rol)) {
    return <Navigate to="/panel" replace />
  }

  function Sidebar() {
    return (
      <>
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar src={user!.fotoPerfil} name={user!.nombre} size="md" />
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-semibold">{user!.nombre}</p>
              <p className="truncate text-xs text-ink-400">{user!.roles.join(' · ')}</p>
            </div>
          </div>
          <RolSwitcher user={user!} />
        </div>
        <nav className="rounded-2xl border border-navy/10 bg-paper p-2">
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
                    'flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
                    isActive ? 'bg-navy text-cream' : 'text-navy hover:bg-navy/5',
                  )
                }
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {l.label}
                </span>
                {l.badge !== undefined && l.badge > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1.5 text-[10px] font-bold text-cream">
                    {l.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>
      </>
    )
  }

  return (
    <div className="container-page py-8 md:py-12">
      {/* Botón hamburguesa móvil */}
      <div className="md:hidden mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-paper px-3 py-1.5 text-sm font-semibold"
          aria-label="Abrir menú"
        >
          <Menu className="h-4 w-4" /> Menú
        </button>
        <p className="text-xs text-ink-400">{titulo}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <aside className="hidden md:flex md:flex-col space-y-5">
          <Sidebar />
        </aside>
        <section>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </section>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-navy/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85%] overflow-y-auto bg-cream-soft p-5 space-y-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 hover:bg-ink-100"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Sidebar />
          </aside>
        </div>
      )}
    </div>
  )
}
