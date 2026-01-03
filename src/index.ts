import Database from '~/configs/db'
import { env } from '~/configs/env'
import { logger } from '~/configs/logger'
import { A_SECOND } from '~/constants'
import { app } from '~/server'

const { PORT, HOST, NODE_ENV } = env

const startServer = async () => {
  try {
    // Connect to database
    await Database.connect()

    // Start server
    const server = app.listen(PORT, (error) => {
      if (error) logger.error(error.message)
      else logger.info(`Server ${NODE_ENV.toUpperCase()} ready at http://${HOST}:${PORT}/docs...`)
    })

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received, closing server gracefully...`)

      server.close(async () => {
        console.log('HTTP server closed')
        await Database.disconnect()
        process.exit(0)
      })

      // Force shutdown after 10s
      setTimeout(() => {
        console.error('Forcing shutdown...')
        process.exit(1)
      }, 3 * A_SECOND)
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  } catch (error) {
    console.error(`Failed to start server: `, error)
    process.exit(1)
  }
}

startServer()
