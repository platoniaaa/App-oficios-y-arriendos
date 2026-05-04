import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { BottomNav } from './BottomNav'
import { ChatbotFab } from './ChatbotFab'
import { useModo } from '@/stores/useModo'
import { Bienvenida } from '@/pages/Bienvenida'

const PUBLIC_PATHS_BYPASS_BIENVENIDA = ['/login', '/registro', '/recuperar', '/terminos', '/privacidad']

export function AppLayout() {
  const modo = useModo((s) => s.modo)
  const loc = useLocation()
  const bypass = PUBLIC_PATHS_BYPASS_BIENVENIDA.some((p) => loc.pathname.startsWith(p))

  if (!modo && !bypass) return <Bienvenida />

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <ChatbotFab />
    </div>
  )
}
