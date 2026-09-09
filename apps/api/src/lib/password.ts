import argon2 from 'argon2'

/**
 * Hash de contraseñas con Argon2id.
 *
 * En la base de datos SOLO se guarda `passwordHash`. La contraseña en claro
 * no se almacena, no se registra en logs y no sale nunca de esta capa.
 */
export function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, { type: argon2.argon2id })
}

/** Comprueba una contraseña contra su hash. */
export async function verifyPassword(hash: string, plainPassword: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainPassword)
  } catch {
    // Un hash corrupto o con formato desconocido no debe tumbar el login:
    // simplemente no coincide.
    return false
  }
}
