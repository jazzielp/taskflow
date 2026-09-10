import { TASK_STATUSES, type TaskDto, type TaskStatus } from '@taskflow/contracts'
import { ALLOWED_TASK_STATUS_TRANSITIONS } from '@taskflow/domain'
import { GitBranch } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { Button } from '../components/ui/Button'
import { Callout } from '../components/ui/Callout'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useDeleteProject, useProject } from '../features/projects/use-projects'
import { BoardColumn } from '../features/tasks/BoardColumn'
import { TaskCard } from '../features/tasks/TaskCard'
import { TaskFormModal, type TaskFormValues } from '../features/tasks/TaskFormModal'
import {
  useCreateTask,
  useDeleteTask,
  useProjectTasks,
  useUpdateTask,
  useUpdateTaskStatus,
} from '../features/tasks/use-tasks'

/** "TODO → IN_PROGRESS · DONE" a partir de la tabla del dominio, no a mano. */
const TRANSITIONS_SUMMARY = TASK_STATUSES.map(
  (status) => `${status} → ${ALLOWED_TASK_STATUS_TRANSITIONS[status].join(' · ')}`,
).join('   |   ')

export function ProjectDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const project = useProject(id)
  const tasks = useProjectTasks(id)

  const createTask = useCreateTask(id)
  const updateTask = useUpdateTask(id)
  const deleteTask = useDeleteTask(id)
  const moveTask = useUpdateTaskStatus(id)
  const deleteProject = useDeleteProject()

  const [taskForm, setTaskForm] = useState<{ task?: TaskDto } | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<TaskDto | null>(null)
  const [isDeletingProject, setDeletingProject] = useState(false)

  const projectName = project.data?.name ?? 'este proyecto'
  const items = tasks.data?.data ?? []

  function handleTaskSubmit(values: TaskFormValues) {
    const editing = taskForm?.task
    const mutation = editing
      ? updateTask.mutateAsync({ id: editing.id, input: values })
      : createTask.mutateAsync(values)

    void mutation.then(() => setTaskForm(null)).catch(() => undefined)
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="flex items-start justify-between gap-6">
        <div className="flex max-w-[640px] flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.isPending ? 'Cargando…' : projectName}
          </h1>
          {project.data?.description && (
            <p className="text-[13.5px] leading-relaxed text-tf-muted">
              {project.data.description}
            </p>
          )}
          <p className="flex items-center gap-2.5 font-tf-mono text-[10px] tracking-wide text-tf-dim">
            <span>{items.length} TAREAS</span>
            <span aria-hidden="true">·</span>
            <span>{completionOf(items)}% COMPLETADO</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Button variant="danger" onClick={() => setDeletingProject(true)}>
            Eliminar proyecto
          </Button>
          <Button onClick={() => setTaskForm({})}>Nueva tarea</Button>
        </div>
      </header>

      {project.error && (
        <Callout title="No hemos podido cargar el proyecto">
          {project.error instanceof Error ? project.error.message : 'Inténtalo de nuevo.'}
        </Callout>
      )}

      {tasks.error && (
        <Callout title="No hemos podido cargar las tareas">
          {tasks.error instanceof Error ? tasks.error.message : 'Inténtalo de nuevo.'}
        </Callout>
      )}

      {moveTask.error && (
        <Callout title="No se ha podido mover la tarea">
          {moveTask.error instanceof Error ? moveTask.error.message : 'Inténtalo de nuevo.'}
        </Callout>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-3">
        {TASK_STATUSES.map((status) => {
          const column = items.filter((task) => task.status === status)

          return (
            <BoardColumn
              key={status}
              status={status}
              count={column.length}
              onAdd={status === 'TODO' ? () => setTaskForm({}) : undefined}
            >
              {column.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isMoving={moveTask.isPending && moveTask.variables?.id === task.id}
                  onMove={(next) => moveTask.mutate({ id: task.id, status: next })}
                  onEdit={() => setTaskForm({ task })}
                  onDelete={() => setTaskToDelete(task)}
                />
              ))}
            </BoardColumn>
          )
        })}
      </div>

      <footer className="flex items-center gap-2.5 rounded-tf-md border border-tf-border bg-tf-surface px-3.5 py-2.5">
        <GitBranch className="size-3.5 shrink-0 text-tf-dim" aria-hidden="true" />
        <span className="font-tf-mono text-[10px] tracking-wide text-tf-dim">
          TRANSICIONES PERMITIDAS
        </span>
        <span className="text-[12.5px] text-tf-muted">{TRANSITIONS_SUMMARY}</span>
      </footer>

      {taskForm && (
        <TaskFormModal
          projectName={projectName}
          task={taskForm.task}
          isPending={createTask.isPending || updateTask.isPending}
          error={taskForm.task ? updateTask.error : createTask.error}
          onSubmit={handleTaskSubmit}
          onClose={() => setTaskForm(null)}
        />
      )}

      {taskToDelete && (
        <ConfirmDialog
          title="Eliminar tarea"
          description={`«${taskToDelete.title}» se borrará para siempre. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar tarea"
          isPending={deleteTask.isPending}
          onCancel={() => setTaskToDelete(null)}
          onConfirm={() => {
            void deleteTask
              .mutateAsync(taskToDelete.id)
              .then(() => setTaskToDelete(null))
              .catch(() => undefined)
          }}
        />
      )}

      {isDeletingProject && (
        <ConfirmDialog
          title="Eliminar proyecto"
          description={`Se borrarán «${projectName}» y sus ${items.length} tareas. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar proyecto"
          isPending={deleteProject.isPending}
          onCancel={() => setDeletingProject(false)}
          onConfirm={() => {
            void deleteProject
              .mutateAsync(id)
              .then(() => navigate('/projects', { replace: true }))
              .catch(() => setDeletingProject(false))
          }}
        />
      )}
    </div>
  )
}

function completionOf(tasks: TaskDto[]): number {
  if (tasks.length === 0) return 0
  const done = tasks.filter((task) => task.status === ('DONE' satisfies TaskStatus)).length
  return Math.round((done / tasks.length) * 100)
}
