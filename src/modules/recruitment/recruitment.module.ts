import { Module } from '@nestjs/common'
import { PrismaModule } from '~/prisma/prisma.module'
import { AdminCandidatesController } from './admin/admin-candidates.controller'
import { AdminDepartmentsController } from './admin/admin-departments.controller'
import { AdminJobsController } from './admin/admin-jobs.controller'
import { ClientCandidatesController } from './client/client-candidates.controller'
import { ClientJobsController } from './client/client-jobs.controller'
import { RecruitmentService } from './recruitment.service'
import { UploadService } from './upload.service'

@Module({
  imports: [PrismaModule],
  controllers: [
    ClientJobsController,
    ClientCandidatesController,
    AdminDepartmentsController,
    AdminJobsController,
    AdminCandidatesController,
  ],
  providers: [RecruitmentService, UploadService],
})
export class RecruitmentModule {}
