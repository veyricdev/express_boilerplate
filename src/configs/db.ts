import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '~/prisma/generated/prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

class Database {
  private static instance: PrismaClient

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!Database.instance) {
      const adapter = new PrismaPg({ connectionString })
      const prisma = new PrismaClient({ adapter })
      Database.instance = prisma
    }

    return Database.instance
  }

  public static async connect() {
    try {
      await Database.getInstance().$connect()
      console.log('✅ Database connected successfully')
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      process.exit(1)
    }
  }

  public static async disconnect() {
    await Database.getInstance().$disconnect()
    console.log('Database disconnected')
  }
}

export const prisma = Database.getInstance()

export default Database
