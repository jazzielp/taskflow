import { ApiClientError, fieldErrorsOf } from '@taskflow/api-client'
import { createProjectSchema, LIMITS } from '@taskflow/contracts'
import { useState, type FormEvent } from 'react'

import { Button } from '../../components/ui/Button'
import { Callout } from '../../components/ui/Callout'
import { Field } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { TextArea } from '../../components/ui/TextArea'

export type ProjectFormValues = {
  name: string
  description?: string
}

export function ProjectFormModal({
  isPending,
  error,
  onSubmit,
  onClose,
}: {
  isPending: boolean
  error: unknown
  onSubmit: (values: ProjectFormValues) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

  const apiError = error instanceof ApiClientError ? error : null
  const fieldErrors = { ...fieldErrorsOf(apiError), ...localErrors }
  const generalError = apiError && !apiError.isValidationError ? apiError : null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = createProjectSchema.safeParse({
      name,
      description: description.trim() === '' ? undefined : description,
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
    onSubmit(parsed.data)
  }

  return (
    <Modal
      title="Nuevo proyecto"
      description="Un proyecto agrupa tareas y solo lo ve quien es su dueño."
      onClose={onClose}
    >
      {generalError && <Callout title="No se ha podido crear">{generalError.message}</Callout>}

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <Field
          label="Nombre"
          value={name}
          autoFocus
          maxLength={LIMITS.projectNameMaxLength}
          onChange={(event) => setName(event.target.value)}
          error={fieldErrors.name}
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

        <div className="flex justify-end gap-2.5 border-t border-tf-border pt-5">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creando…' : 'Crear proyecto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
