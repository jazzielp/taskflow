import type { TaskStatus } from '@taskflow/contracts'
import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'

const COLUMN_STYLES: Record<TaskStatus, { dot: string; label: string }> = {
  TODO: { dot: 'bg-tf-todo', label: 'text-tf-todo' },
  IN_PROGRESS: { dot: 'bg-tf-in-progress', label: 'text-tf-in-progress' },
  DONE: { dot: 'bg-tf-done', label: 'text-tf-done' },
}

/** Solo TODO invita a crear: es la única entrada natural del flujo. */
const PLACEHOLDER: Record<TaskStatus, string> = {
  TODO: 'Aquí nacen las tareas',
  IN_PROGRESS: 'Nada en curso',
  DONE: 'Nada terminado todavía',
}

export function BoardColumn({
  status,
  count,
  onAdd,
  children,
}: {
  status: TaskStatus
  count: number
  onAdd?: () => void
  children: ReactNode
}) {
  const style = COLUMN_STYLES[status]

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3 rounded-tf-lg border border-tf-border bg-tf-surface-2 p-3.5">
      <header className="flex items-center justify-between px-1 py-0.5">
        <div className="flex items-center gap-2">
          <span className={`size-[7px] rounded-full ${style.dot}`} aria-hidden="true" />
          <h2 className={`font-tf-mono text-[11px] tracking-wide ${style.label}`}>{status}</h2>
          <span className="rounded-full bg-tf-bg px-[7px] py-0.5 font-tf-mono text-[10px] text-tf-muted">
            {count}
          </span>
        </div>

        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            aria-label="Añadir tarea"
            className="text-tf-dim transition hover:text-tf-accent"
          >
            <Plus className="size-[15px]" aria-hidden="true" />
          </button>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-tf-md border border-tf-border-strong px-4 py-7 text-center">
            <p className="text-[13px] text-tf-dim">{PLACEHOLDER[status]}</p>
            {onAdd && (
              <button
                type="button"
                onClick={onAdd}
                className="flex items-center gap-1.5 text-[13px] font-medium text-tf-accent hover:underline"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Añadir la primera
              </button>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  )
}
