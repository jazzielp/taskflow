import type { TaskStatus } from '@taskflow/contracts'

/**
 * Un color por estado. Las clases están escritas enteras a propósito: Tailwind
 * analiza el código como texto y una clase construida por concatenación
 * (`text-tf-${status}`) no llegaría al CSS final.
 */
const STYLES: Record<TaskStatus, { dot: string; text: string }> = {
  TODO: { dot: 'bg-tf-todo', text: 'text-tf-todo' },
  IN_PROGRESS: { dot: 'bg-tf-in-progress', text: 'text-tf-in-progress' },
  DONE: { dot: 'bg-tf-done', text: 'text-tf-done' },
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const style = STYLES[status]

  return (
    <span className="inline-flex items-center gap-[7px] rounded-full border border-tf-border-strong bg-tf-surface-2 px-2.5 py-[5px]">
      <span className={`size-[7px] rounded-full ${style.dot}`} aria-hidden="true" />
      <span className={`font-tf-mono text-[11px] tracking-wide ${style.text}`}>{status}</span>
    </span>
  )
}
