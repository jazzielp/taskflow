import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-tf-bg text-center">
      <p className="font-tf-mono text-[11px] tracking-widest text-tf-dim">404</p>
      <h1 className="text-[22px] font-semibold">Esta página no existe</h1>
      <Link to="/projects" className="text-sm font-medium text-tf-accent hover:underline">
        Volver a mis proyectos
      </Link>
    </div>
  )
}
