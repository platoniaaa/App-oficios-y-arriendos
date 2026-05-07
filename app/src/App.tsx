import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PanelLayout } from '@/components/layout/PanelLayout'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { Home } from '@/pages/Home'
import { Buscar } from '@/pages/Buscar'
import { ServicioDetalle } from '@/pages/ServicioDetalle'
import { HerramientaDetalle } from '@/pages/HerramientaDetalle'
import { PerfilPublico } from '@/pages/PerfilPublico'
import { Login } from '@/pages/Login'
import { Registro } from '@/pages/Registro'
import { Recuperar } from '@/pages/Recuperar'
import { Bienvenida } from '@/pages/Bienvenida'
import { Asistente } from '@/pages/Asistente'
import { ComoFunciona } from '@/pages/ComoFunciona'
import { Terminos, Privacidad } from '@/pages/Legal'
import { Admin } from '@/pages/Admin'
import { NotFound } from '@/pages/NotFound'
import { PanelHome } from '@/pages/panel/PanelHome'
import { PanelPerfil } from '@/pages/panel/PanelPerfil'
import { MisPublicaciones } from '@/pages/panel/MisPublicaciones'
import { PublicarServicio } from '@/pages/panel/PublicarServicio'
import { PublicarHerramienta } from '@/pages/panel/PublicarHerramienta'
import { Contrataciones } from '@/pages/panel/Contrataciones'
import { ContratacionDetalle } from '@/pages/panel/ContratacionDetalle'
import { Chats } from '@/pages/panel/Chats'
import { ChatConversacion } from '@/pages/panel/ChatConversacion'
import { Notificaciones } from '@/pages/panel/Notificaciones'
import { Resenas } from '@/pages/panel/Resenas'
import { PrestadorLayout } from '@/pages/panel/prestador/Layout'
import { PrestadorDashboard } from '@/pages/panel/prestador/Dashboard'
import { PrestadorMisServicios } from '@/pages/panel/prestador/MisServicios'
import { PrestadorSolicitudes } from '@/pages/panel/prestador/Solicitudes'
import { PrestadorAgenda } from '@/pages/panel/prestador/Agenda'
import { PrestadorIngresos } from '@/pages/panel/prestador/Ingresos'
import { PrestadorResenas } from '@/pages/panel/prestador/Resenas'
import { PrestadorPerfil } from '@/pages/panel/prestador/Perfil'
import { PrestadorConfiguracion } from '@/pages/panel/prestador/Configuracion'
import { ArrendadorLayout } from '@/pages/panel/arrendador/Layout'
import { ArrendadorDashboard } from '@/pages/panel/arrendador/Dashboard'
import { ArrendadorInventario } from '@/pages/panel/arrendador/Inventario'
import { ArrendadorArriendos } from '@/pages/panel/arrendador/Arriendos'
import { ArrendadorCalendario } from '@/pages/panel/arrendador/Calendario'
import { ArrendadorIngresos } from '@/pages/panel/arrendador/Ingresos'
import { ArrendadorResenas } from '@/pages/panel/arrendador/Resenas'
import { ArrendadorPerfil } from '@/pages/panel/arrendador/Perfil'
import { ArrendadorConfiguracion } from '@/pages/panel/arrendador/Configuracion'
import { useAuth } from '@/stores/useAuth'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user())
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function App() {
  useScrollToTop()
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="buscar" element={<Buscar />} />
        <Route path="buscar/servicios" element={<Navigate to="/buscar?tipo=servicios" replace />} />
        <Route path="buscar/herramientas" element={<Navigate to="/buscar?tipo=herramientas" replace />} />
        <Route path="servicio/:id" element={<ServicioDetalle />} />
        <Route path="herramienta/:id" element={<HerramientaDetalle />} />
        <Route path="perfil/:userId" element={<PerfilPublico />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="recuperar" element={<Recuperar />} />
        <Route
          path="bienvenida"
          element={
            <PrivateRoute>
              <Bienvenida />
            </PrivateRoute>
          }
        />
        <Route path="asistente" element={<Asistente />} />
        <Route path="como-funciona" element={<ComoFunciona />} />
        <Route path="terminos" element={<Terminos />} />
        <Route path="privacidad" element={<Privacidad />} />
        <Route path="admin" element={<Admin />} />

        <Route
          path="panel"
          element={
            <PrivateRoute>
              <PanelLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<PanelHome />} />
          <Route path="perfil" element={<PanelPerfil />} />
          <Route path="mis-publicaciones" element={<MisPublicaciones />} />
          <Route path="publicar/servicio" element={<PublicarServicio />} />
          <Route path="publicar/herramienta" element={<PublicarHerramienta />} />
          <Route path="contrataciones" element={<Contrataciones />} />
          <Route path="contratacion/:id" element={<ContratacionDetalle />} />
          <Route path="chats" element={<Chats />} />
          <Route path="chats/:id" element={<ChatConversacion />} />
          <Route path="notificaciones" element={<Notificaciones />} />
          <Route path="resenas" element={<Resenas />} />
        </Route>

        <Route
          path="panel/prestador"
          element={
            <PrivateRoute>
              <PrestadorLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<PrestadorDashboard />} />
          <Route path="servicios" element={<PrestadorMisServicios />} />
          <Route path="solicitudes" element={<PrestadorSolicitudes />} />
          <Route path="agenda" element={<PrestadorAgenda />} />
          <Route path="ingresos" element={<PrestadorIngresos />} />
          <Route path="resenas" element={<PrestadorResenas />} />
          <Route path="perfil" element={<PrestadorPerfil />} />
          <Route path="configuracion" element={<PrestadorConfiguracion />} />
        </Route>

        <Route
          path="panel/arrendador"
          element={
            <PrivateRoute>
              <ArrendadorLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<ArrendadorDashboard />} />
          <Route path="inventario" element={<ArrendadorInventario />} />
          <Route path="arriendos" element={<ArrendadorArriendos />} />
          <Route path="calendario" element={<ArrendadorCalendario />} />
          <Route path="ingresos" element={<ArrendadorIngresos />} />
          <Route path="resenas" element={<ArrendadorResenas />} />
          <Route path="perfil" element={<ArrendadorPerfil />} />
          <Route path="configuracion" element={<ArrendadorConfiguracion />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
