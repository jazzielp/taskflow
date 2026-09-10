import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

/**
 * Las cuatro variantes del sistema de diseño. La jerarquía es intencionada:
 * una acción primaria por pantalla, el resto por debajo.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-tf-accent text-tf-accent-ink hover:brightness-95',
  secondary: 'bg-tf-surface-2 text-tf-text border border-tf-border-strong hover:border-tf-dim',
  ghost: 'text-tf-muted hover:text-tf-text',
  danger: 'border border-tf-danger text-tf-danger hover:bg-tf-danger-soft',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const padding = variant === 'ghost' ? 'px-3.5 py-2.5' : 'px-[18px] py-[11px]'

  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-tf-md text-sm font-medium',
        'transition disabled:cursor-not-allowed disabled:opacity-50',
        padding,
        VARIANTS[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}
