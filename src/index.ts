import { env } from '~/configs/env'
import { logger } from '~/configs/logger'
import { A_SECOND } from '~/constants'
import { app } from '~/server'

const { PORT, HOST, NODE_ENV } = env

const server = app.listen(PORT, (error) => {
  if (error) logger.error(error.message)
  else logger.info(`🚀 Server ${NODE_ENV.toUpperCase()} ready at http://${HOST}:${PORT}/docs...`)
})

const onCloseSignal = () => {
  logger.info('sigint received, shutting down...')
  server.close(() => {
    logger.info('Server closed!')
    process.exit()
  })
  setTimeout(() => process.exit(1), 3 * A_SECOND).unref() // Force shutdown after 3s
}

process.on('SIGINT', onCloseSignal)
process.on('SIGTERM', onCloseSignal)
