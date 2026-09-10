import { ApiClientError, fieldErrorsOf } from '@taskflow/api-client'
import { ERROR_CODES } from '@taskflow/contracts'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'

import { Button } from '../../components/ui/Button'
import { Callout } from '../../components/ui/Callout'
import { Field } from '../../components/ui/Field'

export type AuthFieldConfig = {
  name: string
  label: string
  type?: string
  autoComplete?: string
  hint?: string
}

/**
 * Formulario compartido por /login y /register: las dos pantallas solo se
 * diferencian en los campos, los textos y a quién llaman al enviar.
 *
 * La validación fina la hace la API. El cliente se limita a marcar los campos
 * que el backend señala en `details`, y a mostrar un aviso general para lo que
 * no pertenece a ningún campo (credenciales inválidas, red caída).
 */
export function AuthForm({
  eyebrow,
  title,
  subtitle,
  fields,
  submitLabel,
  footerText,
  footerLinkLabel,
  footerLinkTo,
  onSubmit,
}: {
  eyebrow: string
  title: string
  subtitle: string
  fields: AuthFieldConfig[]
  submitLabel: string
  footerText: string
  footerLinkLabel: string
  footerLinkTo: string
  onSubmit: (values: Record<string, string>) => Promise<void>
}) {
  const [isSubmitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiClientError | null>(null)

  const fieldErrors = fieldErrorsOf(error)
  const generalError = error && !error.isValidationError ? error : null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const form = new FormData(event.currentTarget)
    const values = Object.fromEntries(
      fields.map((field) => [field.name, String(form.get(field.name) ?? '')]),
    )

    try {
      await onSubmit(values)
    } catch (caught) {
      setError(
        caught instanceof ApiClientError
          ? caught
          : new ApiClientError({
              code: ERROR_CODES.INTERNAL_ERROR,
              message: 'Ha ocurrido un error inesperado.',
              cause: caught,
            }),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <p className="font-tf-mono text-[11px] tracking-widest text-tf-accent">{eyebrow}</p>

      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-semibold tracking-tight">{title}</h1>
        <p className="text-sm leading-relaxed text-tf-muted">{subtitle}</p>
      </div>

      {generalError && (
        <Callout title={messageFor(generalError)}>{explanationFor(generalError)}</Callout>
      )}

      <form className="flex flex-col gap-[22px]" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-4">
          {fields.map((field) => (
            <Field
              key={field.name}
              name={field.name}
              label={field.label}
              type={field.type ?? 'text'}
              autoComplete={field.autoComplete}
              hint={field.hint}
              error={fieldErrors[field.name]}
              disabled={isSubmitting}
            />
          ))}
        </div>

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Un momento…' : submitLabel}
        </Button>
      </form>

      <p className="flex justify-center gap-1.5 text-[13px] text-tf-muted">
        {footerText}
        <Link to={footerLinkTo} className="font-medium text-tf-accent hover:underline">
          {footerLinkLabel}
        </Link>
      </p>
    </>
  )
}

function messageFor(error: ApiClientError): string {
  if (error.code === ERROR_CODES.INVALID_CREDENTIALS) return 'No hemos podido iniciar sesión'
  if (error.code === ERROR_CODES.EMAIL_ALREADY_EXISTS) return 'Ese email ya tiene cuenta'
  if (error.code === ERROR_CODES.RATE_LIMITED) return 'Demasiados intentos'
  return 'Algo ha fallado'
}

function explanationFor(error: ApiClientError): string {
  // La API responde 401 sin decir cuál de los dos campos falla, para no
  // revelar si un email está registrado. El mensaje respeta esa decisión.
  if (error.code === ERROR_CODES.INVALID_CREDENTIALS) {
    return 'Revisa el email y la contraseña. Por seguridad no indicamos cuál de los dos no cuadra.'
  }
  return error.message
}
