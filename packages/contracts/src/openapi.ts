import type { ZodType } from 'zod'

import { roleSchema, taskStatusSchema } from './common/enums'
import {
  apiErrorDetailSchema,
  apiErrorSchema,
  errorCodeSchema,
  listMetaSchema,
} from './common/responses'
import { authSessionDtoSchema } from './auth/auth.dto'
import { loginSchema, registerSchema } from './auth/auth.schemas'
import { projectDtoSchema } from './projects/project.dto'
import { createProjectSchema, updateProjectSchema } from './projects/project.schemas'
import { taskDtoSchema } from './tasks/task.dto'
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from './tasks/task.schemas'
import { userDtoSchema } from './users/user.dto'

/**
 * Inventario de los schemas que se publican como componentes reutilizables en
 * la documentación OpenAPI (los que llevan `.meta({ id })`).
 *
 * Zod registra esos schemas en su registro global como efecto de evaluar el
 * módulo. Enumerarlos aquí cumple dos funciones:
 *
 *   1. Garantiza que TODOS los módulos se han evaluado antes de generar el
 *      documento, sin depender de que algo los haya importado por casualidad
 *      (un bundler podría eliminar un `import` sin usar).
 *   2. Deja en un solo sitio qué forma parte de la superficie pública, para que
 *      un schema nuevo sin documentar se detecte en el test de `apps/api`.
 */
export const documentedSchemas: readonly ZodType[] = [
  // Comunes
  roleSchema,
  taskStatusSchema,
  errorCodeSchema,
  listMetaSchema,
  apiErrorDetailSchema,
  apiErrorSchema,
  // Recursos
  userDtoSchema,
  projectDtoSchema,
  taskDtoSchema,
  authSessionDtoSchema,
  // Entradas
  registerSchema,
  loginSchema,
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
]
