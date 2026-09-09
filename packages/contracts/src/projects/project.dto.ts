/** Representación pública de un proyecto. */
export type ProjectDto = {
  id: string
  name: string
  description: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
  /** Número de tareas del proyecto (presente en listados y detalle). */
  taskCount?: number
}
