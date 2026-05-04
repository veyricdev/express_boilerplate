import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { AllExceptionsFilter } from './common/filters/http-exception.filter'
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor'
// Interceptors
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
// Modules
import { LoggerModule } from './common/logger/logger.module'
import configuration from './config/configuration'
import { validate } from './config/env.validation'
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module'
import { AuthModule } from './modules/auth/auth.module'
import { CategoriesModule } from './modules/categories/categories.module'
import { CmsModule } from './modules/cms/cms.module'
import { PostsModule } from './modules/posts/posts.module'
import { SettingsModule } from './modules/settings/settings.module'
import { TagsModule } from './modules/tags/tags.module'
import { UsersModule } from './modules/users/users.module'
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
    SettingsModule,
    LoggerModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: BigIntInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
