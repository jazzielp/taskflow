import type { Role } from '@taskflow/contracts'

/** Usuario autenticado, tal y como lo deja el middleware `authenticate`. */
export type AuthenticatedUser = {
  id: string
  role: Role
}

declare global {
  namespace Express {
    interface Request {
      /** Identificador de la petición, para poder rastrearla en los logs. */
      requestId?: string
      /** Presente solo si la petición pasó por el middleware `authenticate`. */
      user?: AuthenticatedUser
    }
  }
}
