import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor'
// Interceptors
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor'
import configuration from './config/configuration'
import { validate } from './config/env.validation'
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module'
import { AuthModule } from './modules/auth/auth.module'
import { CategoriesModule } from './modules/categories/categories.module'
import { CmsModule } from './modules/cms/cms.module'
import { PostsModule } from './modules/posts/posts.module'
import { TagsModule } from './modules/tags/tags.module'
import { UsersModule } from './modules/users/users.module'
// Modules
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CategoriesModule,
    TagsModule,
    CmsModule,
    AuditLogsModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: BigIntInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
})
export class AppModule {}
