import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function Recuperar() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Ingresa un email válido.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) {
        setError(error.message)
        return
      }
      setEnviado(true)
    } catch (e) {
      console.error('[Recuperar]', e)
      setError(e instanceof Error ? e.message : 'No se pudo enviar el enlace.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-page max-w-md py-16">
      <Link to="/login" className="text-xs font-mono uppercase text-ink-400 hover:text-navy">
        ← volver a login
      </Link>
      <h1 className="font-display text-4xl font-semibold mt-4">Recuperar contraseña</h1>
      {!enviado ? (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input
            label="Correo asociado a tu cuenta"
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.cl"
            required
          />
          {error && (
            <div className="rounded-lg border border-rust/30 bg-rust/5 px-3 py-2 text-sm text-rust">
              {error}
            </div>
          )}
          <Button variant="primary" size="lg" className="w-full" loading={loading} type="submit">
            Enviar enlace de recuperación
          </Button>
        </form>
      ) : (
        <div className="mt-6 rounded-2xl border-2 border-moss/30 bg-moss/10 p-5 text-moss">
          <CheckCircle2 className="h-6 w-6" />
          <h2 className="mt-3 font-display text-xl font-semibold">Revisa tu correo</h2>
          <p className="mt-1 text-sm">
            Te enviamos un enlace a <strong>{email}</strong>. Si no llega en 10 minutos, revisa
            spam.
          </p>
        </div>
      )}
    </div>
  )
}
