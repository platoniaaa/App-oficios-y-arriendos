import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { Bell, MessageCircle, Search, Sparkles, UserCircle2, LogOut } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/stores/useAuth'
import { useNotificaciones } from '@/stores/useNotificaciones'
import { useState } from 'react'
import { cn } from '@/lib/cn'

const navLinks = [
  { to: '/buscar/servicios', label: 'Oficios' },
  { to: '/buscar/herramientas', label: 'Herramientas' },
  { to: '/asistente', label: 'Asistente IA', accent: true },
  { to: '/como-funciona', label: 'Cómo funciona' },
]

export function Header() {
  const user = useAuth((s) => s.user())
  const logout = useAuth((s) => s.logout)
  const noLeidas = useNotificaciones((s) => (user ? s.noLeidas(user.id) : 0))
  const nav = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-cream/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium lg:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'relative inline-flex items-center gap-1 py-1 transition',
                    isActive ? 'text-navy' : 'text-ink-500 hover:text-navy',
                  )
                }
              >
                {l.accent && <Sparkles className="h-3.5 w-3.5 text-ember" />}
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          type="button"
          onClick={() => nav('/buscar/servicios')}
          className="hidden md:flex items-center gap-2 rounded-full border-2 border-navy/10 bg-paper px-4 py-2 text-xs text-ink-400 hover:border-navy/30 hover:text-navy lg:w-72"
        >
          <Search className="h-4 w-4" />
          <span>Busca un oficio o herramienta…</span>
          <span className="ml-auto hidden font-mono text-[10px] text-ink-300 lg:inline">⌘K</span>
        </button>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/panel/chats"
                className="hidden items-center justify-center rounded-full p-2 text-navy hover:bg-navy/5 sm:inline-flex"
                aria-label="Chats"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
              <Link
                to="/panel/notificaciones"
                className="relative inline-flex items-center justify-center rounded-full p-2 text-navy hover:bg-navy/5"
                aria-label="Notificaciones"
              >
                <Bell className="h-5 w-5" />
                {noLeidas > 0 && (
                  <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-bold text-cream">
                    {noLeidas}
                  </span>
                )}
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((x) => !x)}
                  className="flex items-center gap-2 rounded-full border border-navy/15 bg-paper py-1 pl-1 pr-3 hover:border-navy/30"
                >
                  <Avatar src={user.fotoPerfil} name={user.nombre} size="sm" />
                  <span className="hidden text-sm font-medium sm:inline">{user.nombre}</span>
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border-2 border-navy bg-paper shadow-ticket"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <Link to="/panel" className="block px-4 py-2.5 text-sm hover:bg-navy/5" onClick={() => setMenuOpen(false)}>
                      Panel
                    </Link>
                    <Link to="/panel/perfil" className="block px-4 py-2.5 text-sm hover:bg-navy/5" onClick={() => setMenuOpen(false)}>
                      Editar perfil
                    </Link>
                    <Link
                      to="/panel/mis-publicaciones"
                      className="block px-4 py-2.5 text-sm hover:bg-navy/5"
                      onClick={() => setMenuOpen(false)}
                    >
                      Mis publicaciones
                    </Link>
                    <div className="my-1 h-px w-full bg-navy/10" />
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-rust hover:bg-rust/5"
                      onClick={() => {
                        logout()
                        setMenuOpen(false)
                        nav('/')
                      }}
                    >
                      <LogOut className="h-4 w-4" /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost btn-sm hidden sm:inline-flex">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="btn-primary btn-sm inline-flex items-center gap-1">
                <UserCircle2 className="h-4 w-4" /> Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
