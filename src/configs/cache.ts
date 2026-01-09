import Redis from 'ioredis'
import { env } from './env'

class Cache {
  private static instance: Redis

  private constructor() {}

  public static getInstance(): Redis {
    if (!Cache.instance) {
      const redis = new Redis(env.REDIS_URL, {})
      Cache.instance = redis
    }

    return Cache.instance
  }

  public static async connect() {
    const instance = Cache.getInstance()
    instance.on('connect', () => {
      console.log(`Connected: Redis connected!`)
    })

    instance.on('error', (error) => {
      console.error(error)
    })
  }

  public static async disconnect() {
    Cache.getInstance().disconnect()
    console.log('Cache disconnected')
  }
}

export const cache = Cache.getInstance()

export default Cache
