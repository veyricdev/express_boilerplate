import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import multipart from '@fastify/multipart'
import helmet from '@fastify/helmet'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import { AppModule } from './app.module'
import { ApiResponseDto } from './common/dtos/api-response.dto'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }))

  // Multipart (file upload)
  await app.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  })

  // Ensure upload directory exists
  mkdirSync(join(__dirname, '..', 'public', 'uploads', 'cvs'), { recursive: true })

  // Security
  await app.register(helmet, {
    hsts: false,
    contentSecurityPolicy: {
      directives: {
        upgradeInsecureRequests: null,
        defaultSrc: ["'self'", 'unpkg.com'],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'http://localhost:5173',
          'https://cdn.ckeditor.com',
          'https://cdn.jsdelivr.net',
          'https://static.cloudflareinsights.com',
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'http://localhost:5173',
          'https://fonts.googleapis.com',
          'https://cdn.ckeditor.com',
          'https://cdn.jsdelivr.net',
          'https://unpkg.com',
        ],
        fontSrc: ["'self'", 'http://localhost:5173', 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', '*'],
        connectSrc: ["'self'", '*'],
        mediaSrc: ["'self'", '*'],
        frameSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })

  const configService = app.get(ConfigService)
  const corsOrigins = configService.get('corsOrigins')
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  })

  // Global Prefix
  app.setGlobalPrefix('api', {
    exclude: ['cms', 'cms/*path'],
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

  // Serve static files (React build output)
  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/',
  })

  // Handlebars template engine
  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
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

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ApiResponseDto],
  })

  app.use(
    '/docs',
    apiReference({
      content: document,
      persistAuth: true,
      withFastify: true,
    })
  )

  await app.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0')
}
bootstrap()
