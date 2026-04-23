import { useState } from 'react'
import { useAuth } from '@/stores/useAuth'
import { useResenas } from '@/stores/useResenas'
import { usersById } from '@/mocks/users'
import { Avatar } from '@/components/ui/Avatar'
import { RatingDistribution } from '@/components/feature/RatingDistribution'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Star, ThumbsUp, MessageSquare } from 'lucide-react'
import { formatRelative } from '@/lib/format'

export function PrestadorResenas() {
  const user = useAuth((s) => s.user())!
  const resenas = useResenas((s) => s.paraUsuario(user.id))
  const [filtro, setFiltro] = useState<number | 'todas'>('todas')
  const [respondiendo, setRespondiendo] = useState<string | null>(null)
  const [texto, setTexto] = useState('')

  const filtradas = filtro === 'todas' ? resenas : resenas.filter((r) => Math.round(r.estrellas) === filtro)

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase text-ember-600">Reseñas</p>
        <h1 className="font-display text-3xl font-semibold">Lo que dicen de ti</h1>
      </header>

      <div className="card p-6">
        <RatingDistribution resenas={resenas} />
      </div>

      <div className="flex flex-wrap gap-2">
        {(['todas', 5, 4, 3, 2, 1] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={'chip ' + (filtro === f ? 'bg-navy text-white border-navy' : 'hover:bg-ink-100')}
          >
            {f === 'todas' ? 'Todas' : `${f}★`}
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <p className="text-sm text-ink-400 italic">Sin reseñas para este filtro.</p>
      ) : (
        <ul className="space-y-4">
          {filtradas.map((r) => {
            const autor = usersById[r.autorId]
            const isResponding = respondiendo === r.id
            return (
              <li key={r.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <Avatar src={autor?.fotoPerfil} name={autor?.nombre} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{autor?.nombre}</p>
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={n <= r.estrellas ? 'h-3.5 w-3.5 fill-ember text-ember' : 'h-3.5 w-3.5 text-ink-300'} />
                        ))}
                      </span>
                    </div>
                    <p className="text-xs text-ink-400">{formatRelative(r.fecha)}</p>
                    <p className="mt-2 text-sm text-ink-500">{r.comentario}</p>
                    {r.utiles !== undefined && (
                      <p className="mt-2 inline-flex items-center gap-1 text-xs text-ink-400">
                        <ThumbsUp className="h-3 w-3" /> {r.utiles} personas la marcaron útil
                      </p>
                    )}

                    {r.respuesta ? (
                      <div className="mt-3 rounded-xl border-l-4 border-ember bg-ember/5 p-3 text-sm">
                        <p className="font-semibold text-ember-600">Tu respuesta:</p>
                        <p className="text-ink-500 mt-1">{r.respuesta.texto}</p>
                      </div>
                    ) : isResponding ? (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          value={texto}
                          onChange={(e) => setTexto(e.target.value)}
                          placeholder="Agradece la reseña o aclara algún punto…"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setRespondiendo(null)}>
                            Cancelar
                          </Button>
                          <Button variant="ember" size="sm" disabled={texto.length < 5}>
                            Enviar respuesta
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          setRespondiendo(r.id)
                          setTexto('')
                        }}
                      >
                        <MessageSquare className="h-4 w-4" /> Responder
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
