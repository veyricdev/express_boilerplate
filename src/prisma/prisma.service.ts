import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/prisma/client'

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    const dbConfig = configService.get('database')
    const adapter = new PrismaMariaDb({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.name,
    })
    super({ adapter })
  }
}
