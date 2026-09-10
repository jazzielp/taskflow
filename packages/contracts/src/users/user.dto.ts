import { z } from 'zod'

import { roleSchema } from '../common/enums'

/**
 * Representación pública de un usuario.
 * NUNCA incluye `passwordHash`: lo que sale de la API es lo que ve el cliente.
 *
 * El schema es la fuente de verdad y el tipo se deriva de él (`z.infer`), no al
 * revés: así la documentación OpenAPI y el tipo de TypeScript no pueden
 * divergir. Si se añade un campo aquí, aparece en los dos sitios a la vez.
 */
export const userDtoSchema = z
  .object({
    id: z.uuid(),
    name: z.string().meta({ example: 'Ada Lovelace' }),
    email: z.email().meta({ example: 'ada@taskflow.dev' }),
    role: roleSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: 'User', description: 'Representación pública de un usuario.' })

export type UserDto = z.infer<typeof userDtoSchema>
