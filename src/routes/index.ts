import type { Express } from 'express'
import { indexController } from '~/controllers/index.controller'
import errorsRouter from './errors'

export const router = (app: Express) => {
  app.get('/ping', indexController.ping)

  app.use(errorsRouter.PATH, errorsRouter.router)
}

export default router
