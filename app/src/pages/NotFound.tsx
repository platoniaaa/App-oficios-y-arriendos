import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="font-mono text-xs uppercase text-ember">404</p>
      <h1 className="font-display text-7xl font-semibold mt-2">Sin obra en esta dirección</h1>
      <p className="mt-4 text-ink-500 max-w-md mx-auto">
        La página que buscas no existe. Vuelve al inicio o pregúntale al asistente qué puede hacer por
        ti.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/" className="btn-primary btn-lg">Volver al inicio</Link>
        <Link to="/asistente" className="btn-outline btn-lg">Preguntar al asistente</Link>
      </div>
    </div>
  )
}
