import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

/**
 * Diálogo modal.
 *
 * Se cierra con Escape y pulsando fuera. No atrapa el foco dentro del diálogo:
 * para eso haría falta un gestor de foco, y todavía no hay ningún modal lo
 * bastante complejo como para justificarlo.
 */
export function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    // Sin esto la página de detrás sigue haciendo scroll con el modal abierto.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0c10db] p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[520px] flex-col gap-5 rounded-tf-lg border border-tf-border-strong bg-tf-surface p-6 shadow-2xl shadow-black/60"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description && <p className="text-[13px] text-tf-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-tf-dim transition hover:text-tf-text"
          >
            <X className="size-[18px]" aria-hidden="true" />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
