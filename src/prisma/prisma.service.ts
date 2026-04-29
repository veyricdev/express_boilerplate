import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/prisma'

// ─── Soft Delete Utilities ─────────────────────────────────────────────────

const SOFT_DELETE_MODELS = ['User', 'Post', 'Category', 'Tag'] as const

function isSoftDeleteModel(model: string): boolean {
  return (SOFT_DELETE_MODELS as readonly string[]).includes(model)
}

function lcFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1)
}

function sanitizeWhere(where: any) {
  if (!where) return {}
  const clean = { ...where }
  for (const key of Object.keys(clean)) {
    if (clean[key] === undefined) {
      delete clean[key]
    }
  }
  return clean
}

// ─── Filtered Client Factory ───────────────────────────────────────────────
// Wraps a PrismaClient with a $extends that:
//  1. Converts delete/deleteMany → soft delete (sets deletedAt).
//  2. Auto-injects { deletedAt: null } on all read operations.
// Use `prismaService.db` for normal queries.
// Use `prismaService.unfiltered` for Admin restore/hardDelete bypass.

function createFilteredClient(client: PrismaClient) {
  return client.$extends({
    query: {
      $allModels: {
        async delete({ model, args, query }: any) {
          if (!isSoftDeleteModel(model)) return query(args)
          const hasDeletedAt = args.where && 'deletedAt' in args.where
          if (hasDeletedAt) {
            args.where = sanitizeWhere(args.where)
            return query(args)
          }

          return (client as any)[lcFirst(model)].update({
            where: args.where,
            data: { deletedAt: new Date() },
          })
        },

        async deleteMany({ model, args, query }: any) {
          if (!isSoftDeleteModel(model)) return query(args)
          const hasDeletedAt = args.where && 'deletedAt' in args.where
          if (hasDeletedAt) {
            args.where = sanitizeWhere(args.where)
            return query(args)
          }

          return (client as any)[lcFirst(model)].updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          })
        },

        async update({ model, args, query }: any) {
          if (!isSoftDeleteModel(model)) return query(args)
          const hasDeletedAt = args.where && 'deletedAt' in args.where
          const where = sanitizeWhere(args.where)

          if (hasDeletedAt) {
            args.where = where
            return query(args)
          }

          // By default, only update non-deleted records
          args.where = { ...where, deletedAt: null }
          return query(args)
        },

        async updateMany({ model, args, query }: any) {
          if (!isSoftDeleteModel(model)) return query(args)
          const hasDeletedAt = args.where && 'deletedAt' in args.where
          const where = sanitizeWhere(args.where)

          if (hasDeletedAt) {
            args.where = where
            return query(args)
          }

          args.where = { ...where, deletedAt: null }
          return query(args)
        },

        async findFirst({ model, args, query }: any) {
          if (!isSoftDeleteModel(model)) return query(args)
          const hasDeletedAt = args.where && 'deletedAt' in args.where
          const where = sanitizeWhere(args.where)

          if (!hasDeletedAt) {
            args.where = { ...where, deletedAt: null }
          } else {
            args.where = where
          }
          return query(args)
        },

        async findFirstOrThrow({ model, args, query }: any) {
          if (!isSoftDeleteModel(model)) return query(args)
          const hasDeletedAt = args.where && 'deletedAt' in args.where
          const where = sanitizeWhere(args.where)

          if (!hasDeletedAt) {
            args.where = { ...where, deletedAt: null }
          } else {
            args.where = where
          }
          return query(args)
        },

        async findMany({ model, args, query }: any) {
          if (!isSoftDeleteModel(model)) return query(args)
          const hasDeletedAt = args.where && 'deletedAt' in args.where
          const where = sanitizeWhere(args.where)

          if (!hasDeletedAt) {
            args.where = { ...where, deletedAt: null }
          } else {
            args.where = where
          }
          return query(args)
        },

        // findUnique cannot combine unique field + extra where in Prisma.
        // We route to findFirst with the same args + deletedAt filter.
        async findUnique({ model, args }: any) {
          if (!isSoftDeleteModel(model)) {
            return (client as any)[lcFirst(model)].findUnique(args)
          }
          const hasDeletedAt = args.where && 'deletedAt' in args.where
          const where = sanitizeWhere(args.where)

          if (!hasDeletedAt) {
            return (client as any)[lcFirst(model)].findFirst({
              ...args,
              where: { ...where, deletedAt: null },
            })
          }
          return (client as any)[lcFirst(model)].findFirst({
            ...args,
            where,
          })
        },

        async findUniqueOrThrow({ model, args }: any) {
          if (!isSoftDeleteModel(model)) {
            return (client as any)[lcFirst(model)].findUniqueOrThrow(args)
          }
          const hasDeletedAt = args.where && 'deletedAt' in args.where
          const where = sanitizeWhere(args.where)

          const finalArgs = !hasDeletedAt ? { ...args, where: { ...where, deletedAt: null } } : { ...args, where }

          const result = await (client as any)[lcFirst(model)].findFirst(finalArgs)
          if (!result) throw new Error(`${model} not found`)
          return result
        },

        async count({ model, args, query }: any) {
          if (!isSoftDeleteModel(model)) return query(args)
          const hasDeletedAt = args.where && 'deletedAt' in args.where
          const where = sanitizeWhere(args.where)

          if (!hasDeletedAt) {
            args.where = { ...where, deletedAt: null }
          } else {
            args.where = where
          }
          return query(args)
        },
      },
    },
  })
}

// ─── PrismaService ─────────────────────────────────────────────────────────

@Injectable()
export class PrismaService {
  /**
   * Filtered client — auto-excludes soft-deleted records.
   * Use this for all standard queries.
   */
  readonly db: ReturnType<typeof createFilteredClient>

  /**
   * Unfiltered client — includes soft-deleted records.
   * Use ONLY in Admin restore / hardDelete operations.
   */
  readonly unfiltered: PrismaClient

  constructor(configService: ConfigService) {
    const dbConfig = configService.get('database')
    const adapter = new PrismaMariaDb({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.name,
    })

    const base = new PrismaClient({ adapter })
    this.unfiltered = base
    this.db = createFilteredClient(base)
  }

  async logAudit(action: string, entity: string, entityId: number) {
    try {
      await this.db.auditLog.create({
        data: { action, entity, entityId },
      })
    } catch {
      // Audit log failure should not break the main operation
    }
  }
}
