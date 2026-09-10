import { useId, type InputHTMLAttributes } from 'react'

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string
  /** Mensaje de error. Si está presente, gana al `hint`. */
  error?: string
  /** Texto de ayuda permanente, por ejemplo el mínimo de caracteres. */
  hint?: string
}

export function Field({ label, error, hint, className = '', ...props }: FieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error ?? hint

  return (
    <div className="flex w-full flex-col gap-[7px]">
      <label
        htmlFor={id}
        className={`text-[13px] font-medium ${error ? 'text-tf-text' : 'text-tf-muted'}`}
      >
        {label}
      </label>

      <input
        id={id}
        // El borde rojo no basta: sin `aria-invalid` un lector de pantalla no
        // se entera de que el campo está en error.
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={[
          'w-full rounded-tf-md bg-tf-surface-2 px-[14px] py-3 text-sm text-tf-text',
          'border outline-none transition placeholder:text-tf-dim',
          error ? 'border-tf-danger' : 'border-tf-border-strong focus:border-tf-accent',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      {message && (
        <p id={messageId} className={`text-xs ${error ? 'text-tf-danger' : 'text-tf-dim'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
