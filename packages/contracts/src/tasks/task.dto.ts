import type { TaskStatus } from '../common/enums'

/** Representación pública de una tarea. */
export type TaskDto = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  projectId: string
  createdAt: string
  updatedAt: string
}
