import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/stores/useAuth'
import { ArrowRight, ShieldCheck, Sparkles, Star } from 'lucide-react'

export function Login() {
  const login = useAuth((s) => s.login)
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErr('')
    try {
      const { user, error } = await login({ email, password })
      if (user) {
        nav('/panel')
        return
      }
      setErr(error ?? 'No se pudo iniciar sesión.')
    } catch (e) {
      console.error('[Login.submit]', e)
      setErr(e instanceof Error ? e.message : 'No se pudo iniciar sesión.')
    } finally {
      setLoading(false)
    }
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

        <ul className="mt-10 space-y-3 text-sm text-ink-500">
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-moss" /> Pagos protegidos en escrow.
          </li>
          <li className="flex items-center gap-2">
            <Star className="h-5 w-5 text-ember" /> Reseñas verificadas.
          </li>
          <li className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-navy" /> Asistente IA que arma proyectos completos.
          </li>
        </ul>
      </div>

      <form onSubmit={submit} className="ticket p-6 md:p-8 space-y-5">
        <h2 className="font-display text-3xl font-semibold">Iniciar sesión</h2>

        <Input
          label="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.cl"
          type="email"
          autoComplete="email"
          required
        />
        <Input
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        {err && (
          <div className="rounded-lg border border-rust/30 bg-rust/5 px-3 py-2 text-sm text-rust">
            {err}
          </div>
        )}
        <Button variant="primary" size="lg" className="w-full" loading={loading} type="submit">
          Entrar <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/recuperar" className="text-navy hover:text-ember">
            ¿Olvidaste tu clave?
          </Link>
          <Link to="/registro" className="font-semibold text-ember hover:underline">
            Crear cuenta
          </Link>
        </div>
      </form>
    </div>
  )
}
