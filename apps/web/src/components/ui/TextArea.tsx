import { useId, type TextareaHTMLAttributes } from 'react'

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: string
  error?: string
  hint?: string
}

export function TextArea({ label, error, hint, className = '', ...props }: TextAreaProps) {
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

      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={[
          'w-full resize-none rounded-tf-md bg-tf-surface-2 px-[14px] py-3 text-sm leading-relaxed text-tf-text',
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
