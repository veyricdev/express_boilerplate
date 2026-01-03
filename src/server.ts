import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { corsOptions } from '~/configs/cors'
import { env } from '~/configs/env'
import { generateOpenAPIDocument } from '~/docs'
import errorHandler from '~/middlewares/error.handler'
import rateLimiter from '~/middlewares/rate.limiter'
import router from '~/routes'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors(corsOptions))

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.scalar.com'],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: env.isProduction ? [] : null,
    },
  })
)

if (env.isProduction) {
  // Set the application to trust the reverse proxy
  app.set('trust proxy', true)

  app.use(compression())

  app.use(rateLimiter)
}

// Routes
router(app)

// Error Handler
app.use(errorHandler)

// API Docs
app.use('/docs', async (req, res) => {
  const { apiReference } = await import('@scalar/express-api-reference')
  return apiReference({
    content: generateOpenAPIDocument(),
    metaData: {
      title: 'Express Boilerplate API',
    },
  })(req, res)
})

export { app }
