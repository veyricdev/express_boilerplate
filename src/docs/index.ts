import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { baseRegistry } from '~/modules/base/base.routes'
import { errorRegistry } from '~/modules/error/error.routes'
import { userRegistry } from '~/modules/user/user.routes'

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([baseRegistry, userRegistry, errorRegistry])
  const generator = new OpenApiGeneratorV3(registry.definitions)

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Swagger API',
      description: 'This is the API for Express V5 Boilerplate',
    },
  })
}
