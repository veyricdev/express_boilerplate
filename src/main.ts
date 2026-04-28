import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import { join } from 'path'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }))

  // Global Prefix
  app.setGlobalPrefix('api', {
    exclude: ['cms', 'cms/(.*)'],
  })

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  )

  // Global Filters & Interceptors
  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalInterceptors(new TransformInterceptor())

  // Serve static files (React build output)
  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/',
  })

  // Handlebars template engine
  app.setViewEngine({
    engine: {
      handlebars: require('hbs'),
    },
    templates: join(__dirname, 'views'),
  })

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS Boilerplate')
    .setDescription('NestJS Boilerplate')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)

  app.use(
    '/docs',
    apiReference({
      content: document,
      persistAuth: true,
      withFastify: true,
    })
  )

  await app.listen(process.env.PORT || 3000)
}
bootstrap()
