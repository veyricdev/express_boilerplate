import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { Router } from 'express'
import { baseController } from './base.controller'

const router = Router()

const PATH = ''

export const baseRegistry = new OpenAPIRegistry()

baseRegistry.registerPath({
  method: 'get',
  path: `${PATH}/ping`,
  summary: 'Ping',
  description: 'API Check Server',
  tags: ['Base'],
  responses: {},
})

router.get('/ping', baseController.ping)

export default {
  router,
  PATH,
}
