import { Button } from './Button'
import { Modal } from './Modal'

/** Confirmación para lo que no tiene vuelta atrás. */
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  isPending = false,
  onConfirm,
  onCancel,
}: {
  title: string
  description: string
  confirmLabel: string
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-[13px] leading-relaxed text-tf-muted">{description}</p>

      <div className="flex justify-end gap-2.5">
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isPending}>
          {isPending ? 'Eliminando…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
