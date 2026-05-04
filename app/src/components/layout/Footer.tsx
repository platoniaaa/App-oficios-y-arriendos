import { Link } from 'react-router-dom'
import { brand } from '@/config/brand'
import { Logo } from '@/components/ui/Logo'
import { AtSign, Globe, Mail, ArrowLeftRight } from 'lucide-react'
import { useModo } from '@/stores/useModo'
import { cn } from '@/lib/cn'

export function Footer() {
  const modo = useModo((s) => s.modo)
  const setModo = useModo((s) => s.setModo)
  const isProf = modo === 'profesional'

  return (
    <footer className="mt-24 border-t-2 border-navy bg-navy text-cream">
      <div className="container-page grid gap-10 py-14 md:grid-cols-5">
        <div className="md:col-span-2 space-y-4">
          <Logo variant="cream" />
          <p className="max-w-xs text-sm text-cream/80">
            {brand.tagline}. Conectamos personas que hacen y máquinas que trabajan en todo Chile, con
            pago protegido en escrow.
          </p>
          <div className="flex items-center gap-3 pt-2 text-cream/70">
            <a href={brand.social.instagram} aria-label="Instagram" className="hover:text-ember">
              <AtSign className="h-5 w-5" />
            </a>
            <a href={brand.social.linkedin} aria-label="LinkedIn" className="hover:text-ember">
              <Globe className="h-5 w-5" />
            </a>
            <a href={`mailto:${brand.support.email}`} className="hover:text-ember">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-mono text-xs uppercase tracking-widest text-cream/60">Explorar</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-ember" to="/buscar/servicios">Buscar oficios</Link></li>
            {isProf && (
              <li><Link className="hover:text-ember" to="/buscar/herramientas">Arrendar herramientas</Link></li>
            )}
            <li><Link className="hover:text-ember" to="/asistente">Asistente IA</Link></li>
            <li><Link className="hover:text-ember" to="/como-funciona">Cómo funciona</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-mono text-xs uppercase tracking-widest text-cream/60">Ofertas</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-ember" to="/registro">Publica tu oficio</Link></li>
            {isProf && (
              <li><Link className="hover:text-ember" to="/registro">Arrienda tus equipos</Link></li>
            )}
            <li><Link className="hover:text-ember" to="/panel/publicar/servicio">Crear servicio</Link></li>
            {isProf && (
              <li><Link className="hover:text-ember" to="/panel/publicar/herramienta">Crear publicación</Link></li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-mono text-xs uppercase tracking-widest text-cream/60">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-ember" to="/terminos">Términos</Link></li>
            <li><Link className="hover:text-ember" to="/privacidad">Privacidad</Link></li>
            <li><a className="hover:text-ember" href={`mailto:${brand.support.email}`}>Soporte</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page py-6">
          <div className="flex flex-col items-start justify-between gap-3 text-xs md:flex-row md:items-center">
            <div className="flex items-center gap-2 text-cream/70">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>Estás viendo Cuadrilla en modo</span>
              <strong className="text-cream">{isProf ? 'Contratista / empresa' : 'Particular'}</strong>
            </div>
            <div className="inline-flex rounded-full border border-cream/15 p-0.5">
              {(['particular', 'profesional'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModo(m)}
                  className={cn(
                    'rounded-full px-3 py-1 text-[11px] font-semibold transition',
                    modo === m
                      ? 'bg-cream text-navy'
                      : 'text-cream/70 hover:text-cream',
                  )}
                >
                  {m === 'particular' ? 'Particular' : 'Contratista / empresa'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-cream/60 md:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.name} — hecho con manos ásperas en Chile.
          </p>
          <p className="font-mono">MVP · prototipo frontend · datos mock</p>
        </div>
      </div>
    </footer>
  )
}
