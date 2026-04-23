import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CheckCircle2 } from 'lucide-react'

export function Recuperar() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  return (
    <div className="container-page max-w-md py-16">
      <Link to="/login" className="text-xs font-mono uppercase text-ink-400 hover:text-navy">
        ← volver a login
      </Link>
      <h1 className="font-display text-4xl font-semibold mt-4">Recuperar contraseña</h1>
      {!enviado ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setEnviado(true)
          }}
          className="mt-6 space-y-4"
        >
          <Input
            label="Correo asociado a tu cuenta"
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.cl"
            required
          />
          <Button variant="primary" size="lg" className="w-full">
            Enviar enlace de recuperación
          </Button>
        </form>
      ) : (
        <div className="mt-6 rounded-2xl border-2 border-moss/30 bg-moss/10 p-5 text-moss">
          <CheckCircle2 className="h-6 w-6" />
          <h2 className="mt-3 font-display text-xl font-semibold">Revisa tu correo</h2>
          <p className="mt-1 text-sm">
            Te enviamos un enlace a <strong>{email}</strong>. Si no llega en 10 minutos, revisa spam.
          </p>
        </div>
      )}
    </div>
  )
}
