import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Aviso de error a nivel de pantalla o de formulario, para lo que no pertenece
 * a ningún campo concreto: un 401, un 500, la red caída.
 */
export function Callout({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex w-full items-start gap-[11px] rounded-tf-md border border-tf-danger bg-tf-danger-soft px-[14px] py-3"
    >
      <CircleAlert className="mt-px size-4 shrink-0 text-tf-danger" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="text-[13.5px] font-semibold text-tf-text">{title}</p>
        {children && <p className="text-[12.5px] leading-relaxed text-tf-muted">{children}</p>}
      </div>
    </div>
  )
}
