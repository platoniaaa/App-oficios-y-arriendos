import { Link, useLocation } from 'react-router-dom'
import type { User } from '@/types'
import { cn } from '@/lib/cn'
import { ShoppingBag, Hammer, Truck } from 'lucide-react'

interface Props {
  user: User
}

export function RolSwitcher({ user }: Props) {
  const loc = useLocation()
  const path = loc.pathname
  const items = [
    { id: 'comprador', label: 'Comprador', icon: ShoppingBag, to: '/panel', active: path === '/panel' || (path.startsWith('/panel/') && !path.startsWith('/panel/prestador') && !path.startsWith('/panel/arrendador')), always: true },
    { id: 'trabajador', label: 'Trabajador', icon: Hammer, to: '/panel/prestador', active: path.startsWith('/panel/prestador'), show: user.roles.includes('trabajador') },
    { id: 'arrendador', label: 'Arrendador', icon: Truck, to: '/panel/arrendador', active: path.startsWith('/panel/arrendador'), show: user.roles.includes('arrendador') },
  ] as const

  const visible = items.filter((i) => ('always' in i && i.always) || ('show' in i && i.show))
  if (visible.length <= 1) return null

  return (
    <div className="rounded-full border border-ink-200 bg-white p-1 flex gap-1">
      {visible.map((i) => (
        <Link
          key={i.id}
          to={i.to}
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition',
            i.active ? 'bg-navy text-white shadow-soft' : 'text-ink-500 hover:bg-ink-100',
          )}
        >
          <i.icon className="h-3.5 w-3.5" />
          {i.label}
        </Link>
      ))}
    </div>
  )
}
