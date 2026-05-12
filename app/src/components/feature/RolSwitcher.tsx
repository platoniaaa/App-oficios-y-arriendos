import { Link, useLocation } from 'react-router-dom'
import type { User } from '@/types'
import { cn } from '@/lib/cn'
import { UserRound, Hammer, Truck } from 'lucide-react'

interface Props {
  user: User
}

interface Item {
  id: 'cliente' | 'trabajador' | 'arrendador'
  label: string
  desc: string
  icon: typeof UserRound
  to: string
  active: boolean
  show: boolean
}

export function RolSwitcher({ user }: Props) {
  const loc = useLocation()
  const path = loc.pathname

  const items: Item[] = [
    {
      id: 'cliente',
      label: 'Cliente',
      desc: 'Contrata y arrienda',
      icon: UserRound,
      to: '/panel',
      active:
        path === '/panel' ||
        (path.startsWith('/panel/') &&
          !path.startsWith('/panel/prestador') &&
          !path.startsWith('/panel/arrendador')),
      show: true,
    },
    {
      id: 'trabajador',
      label: 'Trabajador',
      desc: 'Ofrece tu oficio',
      icon: Hammer,
      to: '/panel/prestador',
      active: path.startsWith('/panel/prestador'),
      show: user.roles.includes('trabajador'),
    },
    {
      id: 'arrendador',
      label: 'Arrendador',
      desc: 'Arrienda tus equipos',
      icon: Truck,
      to: '/panel/arrendador',
      active: path.startsWith('/panel/arrendador'),
      show: user.roles.includes('arrendador'),
    },
  ]

  const visible = items.filter((i) => i.show)
  if (visible.length <= 1) return null

  return (
    <div className="space-y-1">
      {visible.map((i) => (
        <Link
          key={i.id}
          to={i.to}
          className={cn(
            'flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition',
            i.active
              ? 'border-navy bg-navy text-white shadow-soft'
              : 'border-ink-200 bg-white text-ink-600 hover:border-navy/30 hover:bg-ink-50',
          )}
        >
          <span
            className={cn(
              'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
              i.active ? 'bg-white/15' : 'bg-ink-100',
            )}
          >
            <i.icon className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block font-semibold">{i.label}</span>
            <span
              className={cn(
                'block text-[10px]',
                i.active ? 'text-white/70' : 'text-ink-400',
              )}
            >
              {i.desc}
            </span>
          </span>
        </Link>
      ))}
    </div>
  )
}
