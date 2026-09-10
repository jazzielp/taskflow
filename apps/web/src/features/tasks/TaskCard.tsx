import type { TaskDto, TaskStatus } from '@taskflow/contracts'
import { nextStatusesFor } from '@taskflow/domain'
import { Pencil, Trash2 } from 'lucide-react'

import { StatusBadge } from '../../components/ui/StatusBadge'

const SHORT_DATE = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' })

export function TaskCard({
  task,
  isMoving,
  onMove,
  onEdit,
  onDelete,
}: {
  task: TaskDto
  isMoving: boolean
  onMove: (status: TaskStatus) => void
  onEdit: () => void
  onDelete: () => void
}) {
  // Las transiciones salen del dominio, no de una lista escrita a mano aquí:
  // desde DONE solo se puede volver a IN_PROGRESS, y la UI no debe ofrecer más.
  const nextStatuses = nextStatusesFor(task.status)

  return (
    <article
      className={`group flex flex-col gap-3 rounded-tf-md border border-tf-border bg-tf-surface p-4 transition ${
        isMoving ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className={`text-sm font-medium leading-snug ${
            task.status === 'DONE' ? 'text-tf-muted' : 'text-tf-text'
          }`}
        >
          {task.title}
        </h3>

        <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar «${task.title}»`}
            className="rounded p-1 text-tf-dim transition hover:text-tf-text"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Eliminar «${task.title}»`}
            className="rounded p-1 text-tf-dim transition hover:text-tf-danger"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="line-clamp-2 text-[12.5px] leading-relaxed text-tf-muted">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={task.status} />
        <time
          dateTime={task.updatedAt}
          className="font-tf-mono text-[11px] uppercase text-tf-dim"
          title={`Actualizada el ${new Date(task.updatedAt).toLocaleString('es-ES')}`}
        >
          {SHORT_DATE.format(new Date(task.updatedAt))}
        </time>
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-tf-border pt-3">
        {nextStatuses.map((status) => (
          <button
            key={status}
            type="button"
            disabled={isMoving}
            onClick={() => onMove(status)}
            className="rounded-full border border-tf-border-strong px-2.5 py-1 font-tf-mono text-[10px] tracking-wide text-tf-muted transition hover:border-tf-accent hover:text-tf-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            → {status}
          </button>
        ))}
      </div>
    </article>
  )
}
