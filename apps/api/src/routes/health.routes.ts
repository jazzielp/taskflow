import { Router } from 'express'

const router: Router = Router()

/**
 * Comprobación de vida del servicio.
 *
 * Es el único endpoint que no sigue la convención `{ "data": ... }`: lo
 * consumen balanceadores y orquestadores, no la aplicación, y esperan una
 * respuesta plana y estable.
 */
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

export { router as healthRoutes }
