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
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Wrench,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/stores/useAuth'
import { useNotifCount } from '@/hooks/useNotifCount'
import { UbicacionSelector } from '@/components/feature/UbicacionSelector'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

const navLinks = [
  { to: '/buscar', label: 'Contratar' },
  { to: '/asistente', label: 'Asistente IA', accent: true },
  { to: '/como-funciona', label: 'Cómo funciona' },
]

export function Header() {
  const user = useAuth((s) => s.user())
  const logout = useAuth((s) => s.logout)
  const noLeidas = useNotifCount(user?.id)
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

  const [q, setQ] = useState('')
  const searchRef = useRef<HTMLInputElement | null>(null)

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = q.trim()
    nav(t ? `/buscar?q=${encodeURIComponent(t)}` : '/buscar')
  }

  // Atajo ⌘K / Ctrl+K para enfocar el buscador
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-cream/95 backdrop-blur">
      {/* FILA 1 — Logo + Search + Promo */}
      <div className="container-page flex h-16 items-center gap-3 md:gap-6">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        <form
          onSubmit={onSearchSubmit}
          className="flex flex-1 items-center gap-3 rounded-xl border-2 border-navy/15 bg-white px-4 py-2 transition focus-within:border-navy"
          role="search"
        >
          <Search className="h-5 w-5 shrink-0 text-ink-400" />
          <input
            ref={searchRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca un oficio, herramienta o marca…"
            aria-label="Buscar"
            className="flex-1 bg-transparent text-sm text-navy placeholder:text-ink-400 focus:outline-none"
          />
          <span className="ml-1 hidden font-mono text-[10px] text-ink-300 lg:inline">⌘K</span>
          <button
            type="submit"
            aria-label="Buscar"
            className="ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy text-cream transition hover:bg-navy-700"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        <Link
          to="/como-funciona"
          className="hidden shrink-0 items-center gap-2 rounded-full border border-moss/30 bg-moss/10 px-4 py-2 text-xs font-semibold text-moss-600 transition hover:bg-moss hover:text-white lg:inline-flex"
        >
          <ShieldCheck className="h-4 w-4" />
          Pago protegido en escrow
        </Link>
      </div>

      {/* FILA 2 — Ubicación + Nav + Acciones */}
      <div className="border-t border-navy/5 bg-cream/80">
        <div className="container-page flex h-10 items-center gap-3 text-xs">
          <UbicacionSelector />

          <span className="hidden h-4 w-px bg-navy/15 sm:inline-block" />

          <nav className="hidden items-center gap-4 lg:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-1 transition',
                    isActive ? 'font-semibold text-navy' : 'text-ink-500 hover:text-navy',
                  )
                }
              >
                {l.accent && <Sparkles className="h-3 w-3 text-ember" />}
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Publicar dropdown */}
          <div className="relative ml-auto" ref={publicarRef}>
            <button
              type="button"
              onClick={() => setPublicarOpen((x) => !x)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold text-navy transition hover:bg-navy/5',
                publicarOpen && 'bg-navy/10',
              )}
            >
              Publicar
              <ChevronDown className={cn('h-3 w-3 transition', publicarOpen && 'rotate-180')} />
            </button>
            {publicarOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-2xl border-2 border-navy bg-paper shadow-ticket">
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
                      Recibe solicitudes de clientes en tu zona.
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
                      Genera ingresos cuando tus herramientas no las uses.
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

          {!user && (
            <>
              <Link to="/registro" className="hidden text-navy hover:text-ember sm:inline">
                Crea tu cuenta
              </Link>
              <Link to="/login" className="hidden text-navy hover:text-ember sm:inline">
                Ingresa
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={irMisContrataciones}
            className="hidden items-center gap-1 text-navy transition hover:text-ember sm:inline-flex"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Mis contrataciones
          </button>

          {user && (
            <>
              <Link
                to="/panel/chats"
                aria-label="Chats"
                className="hidden items-center justify-center rounded-full p-1 text-navy hover:bg-navy/5 md:inline-flex"
              >
                <MessageCircle className="h-4 w-4" />
              </Link>
              <Link
                to="/panel/notificaciones"
                aria-label="Notificaciones"
                className="relative inline-flex items-center justify-center rounded-full p-1 text-navy hover:bg-navy/5"
              >
                <Bell className="h-4 w-4" />
                {noLeidas > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-ember px-1 text-[9px] font-bold text-cream">
                    {noLeidas}
                  </span>
                )}
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((x) => !x)}
                  className="flex items-center gap-1.5 rounded-full border border-navy/15 bg-paper py-0.5 pl-0.5 pr-2 hover:border-navy/30"
                >
                  <Avatar src={user.fotoPerfil} name={user.nombre} size="xs" />
                  <span className="hidden font-medium text-navy sm:inline">
                    {user.nombre.split(' ')[0]}
                  </span>
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border-2 border-navy bg-paper shadow-ticket"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <Link
                      to="/panel"
                      className="block px-4 py-2.5 text-sm hover:bg-navy/5"
                      onClick={() => setMenuOpen(false)}
                    >
                      Panel
                    </Link>
                    <Link
                      to="/panel/perfil"
                      className="block px-4 py-2.5 text-sm hover:bg-navy/5"
                      onClick={() => setMenuOpen(false)}
                    >
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
          )}

          {!user && (
            <Link
              to="/registro"
              className="inline-flex items-center gap-1 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-cream transition hover:bg-navy-700 sm:hidden"
            >
              <UserCircle2 className="h-3.5 w-3.5" />
              Crear cuenta
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
