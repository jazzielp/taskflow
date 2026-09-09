import { z } from 'zod'

import { LIMITS } from '../common/limits'

/**
 * El orden importa: primero se limpia y después se valida.
 *
 * Si se validara antes, un email con espacios al principio (algo habitual al
 * copiar y pegar, o al autocompletar en el móvil) se rechazaría en lugar de
 * normalizarse. `.pipe()` encadena: limpia -> comprueba.
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Introduce un email válido').max(LIMITS.emailMaxLength))

export const passwordSchema = z
  .string()
  .min(LIMITS.passwordMinLength, `La contraseña debe tener al menos ${LIMITS.passwordMinLength} caracteres`)
  .max(LIMITS.passwordMaxLength)

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(LIMITS.nameMinLength, 'El nombre es obligatorio')
    .max(LIMITS.nameMaxLength),
  email: emailSchema,
  password: passwordSchema,
})
export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: emailSchema,
  // En login no se aplican las reglas de fortaleza: solo se comprueba que hay algo.
  // Así no se filtra información sobre la política de contraseñas.
  password: z.string().min(1, 'La contraseña es obligatoria'),
})
export type LoginInput = z.infer<typeof loginSchema>
