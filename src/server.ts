import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { corsOptions } from '~/configs/cors'
import { env } from '~/configs/env'
import { generateOpenAPIDocument } from '~/docs'
import errorHandler from '~/middlewares/errorHandler'
import rateLimiter from '~/middlewares/rateLimiter'
import requestLogger from '~/middlewares/requestLogger'
import router from '~/routes'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors(corsOptions))

// Request logging
app.use(requestLogger)

if (env.isProduction) {
  // Set the application to trust the reverse proxy
  app.set('trust proxy', true)

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        },
      },
    })
  )

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
  })(req, res)
})

export { app }
