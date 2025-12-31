import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { Router } from 'express'
import ErrorsController from '~/controllers/errors.controller'

const router = Router()

const PREFIX = '/errors'

router.get('/404', ErrorsController.get404)
router.get('/500', ErrorsController.get500)

export const errorsRegisterPath = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    method: 'get',
    path: `${PREFIX}/404`,
    summary: '404',
    description: '404 page',
    tags: ['Errors'],
    responses: {},
  })

  registry.registerPath({
    method: 'get',
    path: `${PREFIX}/500`,
    summary: '500',
    description: '500 page',
    tags: ['Errors'],
    responses: {},
  })
}

export default {
  router,
  PREFIX,
}
