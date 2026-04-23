import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AlertTriangle, Bell, Lock, Pause, Trash2 } from 'lucide-react'
import { useAuth } from '@/stores/useAuth'
import { useNavigate } from 'react-router-dom'

export function PrestadorConfiguracion() {
  const logout = useAuth((s) => s.logout)
  const nav = useNavigate()
  const [notif, setNotif] = useState({
    email: true,
    solicitudes: true,
    mensajes: true,
    pagos: true,
    resenas: false,
    recordatorios: false,
  })
  const [pass, setPass] = useState({ actual: '', nueva: '', confirmar: '' })

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <p className="font-mono text-xs uppercase text-ember-600">Configuración</p>
        <h1 className="font-display text-3xl font-semibold">Ajustes de la cuenta</h1>
      </header>

      <section className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5" />
          <h2 className="font-display text-xl font-semibold">Notificaciones</h2>
        </div>
        <ul className="space-y-2">
          {(
            [
              ['email', 'Recibir notificaciones por email'],
              ['solicitudes', 'Nuevas solicitudes de clientes'],
              ['mensajes', 'Mensajes nuevos en chat'],
              ['pagos', 'Pagos y liberaciones de escrow'],
              ['resenas', 'Reseñas recibidas'],
              ['recordatorios', 'Recordatorios de trabajos agendados'],
            ] as const
          ).map(([k, label]) => (
            <li key={k} className="flex items-center justify-between rounded-xl border border-ink-200 p-3">
              <span className="text-sm">{label}</span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-navy"
                checked={notif[k]}
                onChange={(e) => setNotif({ ...notif, [k]: e.target.checked })}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          <h2 className="font-display text-xl font-semibold">Contraseña</h2>
        </div>
        <Input label="Contraseña actual" type="password" value={pass.actual} onChange={(e) => setPass({ ...pass, actual: e.target.value })} />
        <Input label="Nueva contraseña" type="password" value={pass.nueva} onChange={(e) => setPass({ ...pass, nueva: e.target.value })} />
        <Input label="Confirmar contraseña" type="password" value={pass.confirmar} onChange={(e) => setPass({ ...pass, confirmar: e.target.value })} />
        <div className="flex justify-end">
          <Button variant="primary" size="md">Cambiar contraseña</Button>
        </div>
      </section>

      <section className="card border-rust/30 bg-rust/5 p-6 space-y-3">
        <div className="flex items-center gap-2 text-rust">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="font-display text-xl font-semibold">Zona crítica</h2>
        </div>
        <p className="text-sm text-ink-500">
          Puedes pausar tu cuenta para ocultar tus servicios sin eliminarlos, o eliminarla definitivamente.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="md" className="border-ember/40 text-ember-600 hover:bg-ember hover:text-white">
            <Pause className="h-4 w-4" /> Pausar cuenta
          </Button>
          <Button
            variant="outline"
            size="md"
            className="border-rust/40 text-rust hover:bg-rust hover:text-white"
            onClick={() => {
              if (confirm('¿Eliminar cuenta? Esta acción es irreversible.')) {
                logout()
                nav('/')
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Eliminar cuenta
          </Button>
        </div>
      </section>
    </div>
  )
}
