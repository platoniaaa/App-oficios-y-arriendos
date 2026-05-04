import { Link, useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useModo } from '@/stores/useModo'

export function ChatbotFab() {
  const loc = useLocation()
  const modo = useModo((s) => s.modo)
  if (loc.pathname.startsWith('/asistente')) return null
  const label = modo === 'profesional' ? 'Cotizar obra' : 'Asistente IA'
  return (
    <Link
      to="/asistente"
      className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full border-2 border-navy bg-ember px-4 py-3 text-sm font-semibold text-cream shadow-ticket transition hover:translate-y-[-1px] lg:bottom-6"
      aria-label="Abrir asistente"
    >
      <Sparkles className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">IA</span>
    </Link>
  )
}
