import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { SettingGroup, SettingType } from '~/prisma/generated/prisma'
import { PrismaService } from '~/prisma/prisma.service'
import type { BulkUpdateSettingDto } from './dto/update-settings.dto'
import type { CreateSettingDto } from './dto/create-setting.dto'
import type { UpdateSettingMetadataDto } from './dto/update-setting-metadata.dto'

const CACHE_KEY = 'settings:all'
const CACHE_TTL_SECONDS = 60 * 60 // 1 hour

export interface SettingRecord {
  id: number
  key: string
  value: string | null
  type: SettingType
  group: SettingGroup
  label: string
  description: string | null
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

export type { SettingGroup, SettingType }

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name)

  // In-memory fallback cache
  private memoryCache: SettingRecord[] | null = null

  // ioredis client (lazy-loaded, optional)
  private redis: any | null = null

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const redisUrl = this.config.get<string>('redisUrl')
    if (redisUrl) {
      try {
        // ioredis is a CJS module — use require for compatibility with SWC/ts-node
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const ioredis = require('ioredis')
        const Redis = ioredis.default ?? ioredis
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 2,
          lazyConnect: true,
          enableReadyCheck: false,
        })
        await this.redis.connect()
        this.logger.log('✅ SettingsService: Connected to Redis cache')
      } catch (err) {
        this.logger.warn(`⚠️ SettingsService: Redis unavailable, using in-memory — ${(err as Error).message}`)
        this.redis = null
      }
    } else {
      this.logger.log('ℹ️ SettingsService: REDIS_URL not set — using in-memory cache')
    }
  }

  // ─── Cache helpers ──────────────────────────────────────────────────────────

  private async cacheGet(): Promise<SettingRecord[] | null> {
    if (this.redis) {
      const raw = await this.redis.get(CACHE_KEY).catch(() => null)
      return raw ? (JSON.parse(raw) as SettingRecord[]) : null
    }
    return this.memoryCache
  }

  private async cacheSet(data: SettingRecord[]): Promise<void> {
    if (this.redis) {
      await this.redis.set(CACHE_KEY, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS).catch(() => null)
    } else {
      this.memoryCache = data
    }
  }

  private async cacheInvalidate(): Promise<void> {
    if (this.redis) {
      await this.redis.del(CACHE_KEY).catch(() => null)
    } else {
      this.memoryCache = null
    }
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  async getAll(): Promise<SettingRecord[]> {
    const cached = await this.cacheGet()
    if (cached) return cached

    const settings = await this.prisma.db.setting.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    })
    await this.cacheSet(settings)
    return settings
  }

  async getByGroup(group: SettingGroup): Promise<SettingRecord[]> {
    const all = await this.getAll()
    return all.filter((s) => s.group === group)
  }

  async getValue(key: string): Promise<string | null> {
    const all = await this.getAll()
    return all.find((s) => s.key === key)?.value ?? null
  }

  async create(dto: CreateSettingDto): Promise<SettingRecord> {
    const exists = await this.prisma.db.setting.findUnique({ where: { key: dto.key } })
    if (exists) {
      throw new BadRequestException(`Setting with key "${dto.key}" already exists.`)
    }

    const setting = await this.prisma.db.setting.create({
      data: {
        key: dto.key,
        label: dto.label,
        description: dto.description,
        value: dto.value,
        type: dto.type,
        group: dto.group,
        isSystem: false, // Custom settings are always false
      },
    })
    
    await this.cacheInvalidate()
    return setting
  }

  async updateMetadata(key: string, dto: UpdateSettingMetadataDto): Promise<SettingRecord> {
    const setting = await this.prisma.db.setting.findUnique({ where: { key } })
    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found.`)
    }

    if (setting.isSystem) {
      // For system settings, only allow updating value, label, and description
      if (dto.type && dto.type !== setting.type) {
        throw new ForbiddenException('Cannot change the type of a system setting.')
      }
      if (dto.group && dto.group !== setting.group) {
        throw new ForbiddenException('Cannot change the group of a system setting.')
      }
    }

    const updated = await this.prisma.db.setting.update({
      where: { key },
      data: {
        label: dto.label,
        description: dto.description,
        value: dto.value !== undefined ? dto.value : undefined,
        type: setting.isSystem ? undefined : dto.type,
        group: setting.isSystem ? undefined : dto.group,
      },
    })

    await this.cacheInvalidate()
    return updated
  }

  async delete(key: string): Promise<void> {
    const setting = await this.prisma.db.setting.findUnique({ where: { key } })
    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found.`)
    }

    if (setting.isSystem) {
      throw new ForbiddenException('Cannot delete a system setting.')
    }

    await this.prisma.db.setting.delete({ where: { key } })
    await this.cacheInvalidate()
  }

  async bulkUpdate(updates: BulkUpdateSettingDto[]): Promise<void> {
    await this.prisma.db.$transaction(
      updates.map(({ key, value }) =>
        this.prisma.db.setting.update({
          where: { key },
          data: { value: value ?? null },
        }),
      ),
    )
    await this.cacheInvalidate()
    this.logger.log(`Settings cache invalidated after bulk update (${updates.length} keys)`)
  }

}
