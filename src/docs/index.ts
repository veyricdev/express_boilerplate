import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { errorsRegister } from '~/routes/errors'

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([errorsRegister])
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
