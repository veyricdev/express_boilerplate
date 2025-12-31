import type { Express } from 'express'
import errorsRouter from './errors'

export const router = (app: Express) => {
  app.get('/ping', (_req, res) => {
    res.status(200).send('pong!')
  })

  app.use(errorsRouter.PREFIX, errorsRouter.router)
}

export default router
