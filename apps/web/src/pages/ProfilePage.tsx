import { useQuery } from '@tanstack/react-query'

import { Callout } from '../components/ui/Callout'
import { api } from '../lib/api'

/**
 * Los datos se piden a `/auth/me` en lugar de leerlos de la sesión guardada:
 * así esta pantalla comprueba de verdad que el token viaja y que el backend lo
 * acepta, en vez de mostrar una copia local que podría estar caducada.
 */
export function ProfilePage() {
  const {
    data: user,
    isPending,
    error,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.auth.me(),
  })

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>
        <p className="text-[13px] text-tf-muted">Tu cuenta y la sesión con la que trabajas.</p>
      </header>

      {error && (
        <Callout title="No hemos podido cargar tu perfil">
          {error instanceof Error ? error.message : 'Inténtalo de nuevo.'}
        </Callout>
      )}

      <section className="flex max-w-[720px] flex-col gap-5 rounded-tf-lg border border-tf-border bg-tf-surface p-6">
        <p className="font-tf-mono text-[10px] tracking-widest text-tf-dim">CUENTA</p>

        {isPending && <p className="text-sm text-tf-muted">Cargando…</p>}

        {user && (
          <dl className="flex flex-col">
            {[
              ['Nombre', user.name],
              ['Email', user.email],
              ['Rol', user.role],
            ].map(([label, value], index, all) => (
              <div
                key={label}
                className={[
                  'flex items-center justify-between py-2.5',
                  index < all.length - 1 ? 'border-b border-tf-border' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <dt className="text-[13px] text-tf-muted">{label}</dt>
                <dd className="font-tf-mono text-[11.5px]">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <p className="font-tf-mono text-[10px] tracking-widest text-tf-dim">
        PENDIENTE: EDITAR CUENTA Y CAMBIO DE CONTRASEÑA
      </p>
    </div>
  )
}
