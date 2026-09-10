import { ListChecks } from 'lucide-react'
import type { ReactNode } from 'react'

const CHIPS = ['REST + ZOD', 'JWT', 'OWNERSHIP']

/**
 * Marco de las pantallas de acceso: panel de marca a la izquierda, formulario a
 * la derecha. En pantallas estrechas el panel desaparece; el formulario es lo
 * único imprescindible.
 */
export function AuthLayout({
  headline,
  copy,
  children,
}: {
  headline: string
  copy: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-tf-bg">
      <section className="hidden w-[560px] shrink-0 flex-col justify-between border-r border-tf-border bg-tf-surface p-14 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-tf-accent">
            <ListChecks className="size-4 text-tf-accent-ink" aria-hidden="true" />
          </span>
          <span className="font-semibold tracking-tight">TaskFlow</span>
        </div>

        <div className="flex flex-col gap-[18px]">
          <h1 className="text-[34px] font-semibold leading-tight tracking-tight">{headline}</h1>
          <p className="text-[15px] leading-relaxed text-tf-muted">{copy}</p>
        </div>

        <ul className="flex gap-2">
          {CHIPS.map((chip) => (
            <li
              key={chip}
              className="rounded-full border border-tf-border-strong px-2.5 py-1.5 font-tf-mono text-[10px] tracking-widest text-tf-dim"
            >
              {chip}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-1 items-center justify-center p-8 lg:p-14">
        <div className="flex w-full max-w-[400px] flex-col gap-[22px]">{children}</div>
      </section>
    </div>
  )
}
