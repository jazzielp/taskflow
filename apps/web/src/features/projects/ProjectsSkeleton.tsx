/**
 * Silueta de la rejilla mientras carga. Repite la forma de `ProjectCard` para
 * que el contenido real no descoloque la página al llegar.
 */
export function ProjectsSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <li
          key={index}
          className="flex animate-pulse flex-col gap-3.5 rounded-tf-lg border border-tf-border bg-tf-surface p-5"
          style={{ opacity: 1 - index * 0.11 }}
        >
          <span className="size-[34px] rounded-tf-sm bg-tf-surface-2" />
          <span className="h-[15px] w-[150px] rounded bg-tf-surface-2" />
          <span className="h-2.5 w-full rounded bg-tf-surface-2" />
          <span className="h-2.5 w-3/5 rounded bg-tf-surface-2" />
          <span className="h-2.5 w-[66px] rounded bg-tf-surface-2" />
        </li>
      ))}
    </ul>
  )
}
