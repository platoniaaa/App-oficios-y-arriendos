import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import {
  Bell,
  ChevronDown,
  ClipboardList,
  Hammer,
  HelpCircle,
  LogOut,
  MessageCircle,
  Search,
  Sparkles,
  UserCircle2,
  Wrench,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/stores/useAuth'
import { useNotificaciones } from '@/stores/useNotificaciones'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

const navLinks = [
  { to: '/buscar', label: 'Buscar' },
  { to: '/asistente', label: 'Asistente IA', accent: true },
  { to: '/como-funciona', label: 'Cómo funciona' },
]

export function Header() {
  const user = useAuth((s) => s.user())
  const logout = useAuth((s) => s.logout)
  const noLeidas = useNotificaciones((s) => (user ? s.noLeidas(user.id) : 0))
  const nav = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [publicarOpen, setPublicarOpen] = useState(false)
  const publicarRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (publicarRef.current && !publicarRef.current.contains(e.target as Node)) {
        setPublicarOpen(false)
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setPublicarOpen(false)
    }
    if (publicarOpen) {
      document.addEventListener('mousedown', onClick)
      document.addEventListener('keydown', onEsc)
    }
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [publicarOpen])

  function rutaPublicar(opcion: 'servicio' | 'herramienta') {
    if (!user) {
      nav('/login')
    } else {
      nav(opcion === 'servicio' ? '/panel/publicar/servicio' : '/panel/publicar/herramienta')
    }
    setPublicarOpen(false)
  }

  const irMisContrataciones = () => nav(user ? '/panel/contrataciones' : '/login')

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-cream/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
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
          onClick={() => nav('/buscar')}
          className="hidden md:flex items-center gap-2 rounded-full border-2 border-navy/10 bg-paper px-4 py-2 text-xs text-ink-400 hover:border-navy/30 hover:text-navy lg:w-64 xl:w-72"
        >
          <Search className="h-4 w-4" />
          <span>Busca un oficio o herramienta…</span>
          <span className="ml-auto hidden font-mono text-[10px] text-ink-300 xl:inline">⌘K</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Publicar dropdown — siempre visible */}
          <div className="relative" ref={publicarRef}>
            <button
              type="button"
              onClick={() => setPublicarOpen((x) => !x)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border-2 border-navy bg-cream px-3 py-1.5 text-xs font-semibold text-navy transition hover:bg-navy hover:text-cream sm:px-4 sm:text-sm',
                publicarOpen && 'bg-navy text-cream',
              )}
            >
              Publicar
              <ChevronDown className={cn('h-3.5 w-3.5 transition', publicarOpen && 'rotate-180')} />
            </button>
            {publicarOpen && (
              <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border-2 border-navy bg-paper shadow-ticket">
                <button
                  type="button"
                  onClick={() => rutaPublicar('servicio')}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-cream-soft"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ember/10 text-ember-600">
                    <Hammer className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-semibold text-navy">Ofrecer mi oficio</span>
                    <span className="block text-xs text-ink-500">
                      Publica tu perfil y recibe solicitudes de clientes en tu zona.
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => rutaPublicar('herramienta')}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-cream-soft"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
                    <Wrench className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-semibold text-navy">Arrendar mis equipos</span>
                    <span className="block text-xs text-ink-500">
                      Tus herramientas o maquinaria pueden generar ingresos cuando no las usas.
                    </span>
                  </span>
                </button>
                <div className="my-1 h-px w-full bg-navy/10" />
                <Link
                  to="/como-funciona"
                  onClick={() => setPublicarOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs text-ink-500 hover:bg-cream-soft hover:text-navy"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Cómo gano dinero en Cuadrilla
                </Link>
              </div>
            )}
          </div>

          {/* Mis contrataciones — siempre visible */}
          <button
            type="button"
            onClick={irMisContrataciones}
            className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-navy transition hover:bg-navy/5 sm:inline-flex sm:text-sm"
          >
            <ClipboardList className="h-4 w-4" />
            <span>Mis contrataciones</span>
          </button>

          {user ? (
            <>
              <Link
                to="/panel/chats"
                className="hidden items-center justify-center rounded-full p-2 text-navy hover:bg-navy/5 md:inline-flex"
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
                    <Link
                      to="/panel/contrataciones"
                      className="block px-4 py-2.5 text-sm hover:bg-navy/5 sm:hidden"
                      onClick={() => setMenuOpen(false)}
                    >
                      Mis contrataciones
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
              <Link to="/login" className="btn-ghost btn-sm hidden md:inline-flex">
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
