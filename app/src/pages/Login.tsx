import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/stores/useAuth'
import { Mail, Lock, ArrowRight, HardHat, User2, Truck } from 'lucide-react'

export function Login() {
  const login = useAuth((s) => s.login)
  const loginDemo = useAuth((s) => s.loginDemo)
  const nav = useNavigate()
  const [email, setEmail] = useState('demo-cliente@cuadrilla.cl')
  const [password, setPassword] = useState('demo')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErr('')
    const u = await login({ email, password })
    setLoading(false)
    if (u) nav('/panel')
    else setErr('Email no encontrado. Prueba con un botón de demo.')
  }

  return (
    <div className="container-page grid min-h-[80vh] items-center gap-12 py-10 md:grid-cols-2">
      <div className="hidden md:block">
        <Logo />
        <h1 className="font-display text-5xl lg:text-6xl font-semibold leading-none mt-8">
          Bienvenido <span className="italic text-ember">de vuelta</span>.
        </h1>
        <p className="mt-4 max-w-md text-ink-500">
          Tu cuadrilla te está esperando. Revisa tus contrataciones, responde mensajes o publica un
          nuevo trabajo.
        </p>

        <div className="mt-10 space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-400">Acceso demo rápido</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { role: 'cliente', label: 'Cliente', icon: User2 },
              { role: 'trabajador', label: 'Trabajador', icon: HardHat },
              { role: 'arrendador', label: 'Arrendador', icon: Truck },
            ].map((d) => (
              <button
                key={d.role}
                type="button"
                className="ticket-sm p-4 text-left hover:bg-cream-deep"
                onClick={() => {
                  const u = loginDemo(d.role as 'cliente' | 'trabajador' | 'arrendador')
                  if (u) nav('/panel')
                }}
              >
                <d.icon className="h-5 w-5 text-ember mb-2" />
                <p className="font-display text-lg font-semibold">{d.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="ticket p-6 md:p-8 space-y-5">
        <h2 className="font-display text-3xl font-semibold">Iniciar sesión</h2>

        <Input
          label="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.cl"
          prefix=""
          type="email"
        />
        <Input
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="••••••••"
        />
        {err && <p className="text-sm text-rust">{err}</p>}
        <Button variant="primary" size="lg" className="w-full" loading={loading} type="submit">
          Entrar <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/recuperar" className="text-navy hover:text-ember">¿Olvidaste tu clave?</Link>
          <Link to="/registro" className="font-semibold text-ember hover:underline">Crear cuenta</Link>
        </div>

        <div className="rule-dashed" />

        <div className="flex flex-wrap gap-2 text-xs text-ink-400">
          <Mail className="h-3 w-3" /> demo-cliente@cuadrilla.cl
          <Lock className="h-3 w-3 ml-2" /> cualquier clave funciona en el mock.
        </div>
      </form>
    </div>
  )
}
