import { ApiClientError, fieldErrorsOf } from '@taskflow/api-client'
import {
  createTaskSchema,
  LIMITS,
  TASK_STATUSES,
  type TaskDto,
  type TaskStatus,
} from '@taskflow/contracts'
import { useState, type FormEvent } from 'react'

import { Button } from '../../components/ui/Button'
import { Callout } from '../../components/ui/Callout'
import { Field } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { TextArea } from '../../components/ui/TextArea'

const STATUS_DOT: Record<TaskStatus, string> = {
  TODO: 'bg-tf-todo',
  IN_PROGRESS: 'bg-tf-in-progress',
  DONE: 'bg-tf-done',
}

export type TaskFormValues = {
  title: string
  description?: string
  status?: TaskStatus
}

/**
 * Alta y edición de una tarea comparten formulario: los campos son los mismos y
 * solo cambia quién recibe los valores.
 *
 * Al crear se puede elegir el estado inicial; al editar no, porque mover una
 * tarea es otra operación con sus propias reglas (`PATCH /tasks/:id/status`) y
 * mezclarlas aquí saltaría las transiciones permitidas.
 */
export function TaskFormModal({
  projectName,
  task,
  isPending,
  error,
  onSubmit,
  onClose,
}: {
  projectName: string
  task?: TaskDto
  isPending: boolean
  error: unknown
  onSubmit: (values: TaskFormValues) => void
  onClose: () => void
}) {
  const isEditing = task !== undefined
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'TODO')
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

  const apiError = error instanceof ApiClientError ? error : null
  const fieldErrors = { ...fieldErrorsOf(apiError), ...localErrors }
  const generalError = apiError && !apiError.isValidationError ? apiError : null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Se valida con el mismo schema que aplica la API: el usuario ve el error
    // sin esperar a la red, y el backend lo vuelve a comprobar igualmente.
    const parsed = createTaskSchema.safeParse({
      title,
      description: description.trim() === '' ? undefined : description,
      status,
    })

    if (!parsed.success) {
      const errors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? '')
        errors[field] ??= issue.message
      }
      setLocalErrors(errors)
      return
    }

    setLocalErrors({})
    onSubmit(isEditing ? { title: parsed.data.title, description: parsed.data.description } : parsed.data)
  }

  return (
    <Modal
      title={isEditing ? 'Editar tarea' : 'Nueva tarea'}
      description={
        isEditing ? `Dentro de ${projectName}.` : `Se creará dentro de ${projectName}.`
      }
      onClose={onClose}
    >
      {generalError && <Callout title="No se ha podido guardar">{generalError.message}</Callout>}

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <Field
          label="Título"
          value={title}
          autoFocus
          maxLength={LIMITS.taskTitleMaxLength}
          onChange={(event) => setTitle(event.target.value)}
          error={fieldErrors.title}
          hint={`${title.length} / ${LIMITS.taskTitleMaxLength}`}
          disabled={isPending}
        />

        <TextArea
          label="Descripción (opcional)"
          value={description}
          rows={3}
          maxLength={LIMITS.descriptionMaxLength}
          onChange={(event) => setDescription(event.target.value)}
          error={fieldErrors.description}
          hint={`${description.length} / ${LIMITS.descriptionMaxLength}`}
          disabled={isPending}
        />

        {!isEditing && (
          <fieldset className="flex flex-col gap-2.5">
            <legend className="text-[13px] font-medium text-tf-muted">Estado inicial</legend>

            <div className="flex flex-wrap gap-2">
              {TASK_STATUSES.map((option) => {
                const isSelected = option === status
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setStatus(option)}
                    className={[
                      'flex items-center gap-[7px] rounded-full border px-3 py-[7px] transition',
                      isSelected
                        ? 'border-tf-accent bg-tf-accent-soft text-tf-text'
                        : 'border-tf-border-strong bg-tf-surface-2 text-tf-muted hover:text-tf-text',
                    ].join(' ')}
                  >
                    <span
                      className={`size-[7px] rounded-full ${isSelected ? STATUS_DOT[option] : 'bg-tf-dim'}`}
                      aria-hidden="true"
                    />
                    <span className="font-tf-mono text-[10.5px] tracking-wide">{option}</span>
                  </button>
                )
              })}
            </div>

            <p className="font-tf-mono text-[10px] tracking-wide text-tf-dim">
              SI SE OMITE, LA TAREA NACE EN TODO
            </p>
          </fieldset>
        )}

        <div className="flex justify-end gap-2.5 border-t border-tf-border pt-5">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear tarea'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
