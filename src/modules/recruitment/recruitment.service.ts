import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import slugify from 'slugify'
import { JobStatus } from '~/prisma/generated/prisma'
import { PrismaService } from '~/prisma/prisma.service'
import type { CreateDepartmentDto } from './dto/create-department.dto'
import type { CreateJobDto } from './dto/create-job.dto'
import type { FindCandidatesDto } from './dto/find-candidates.dto'
import type { FindJobsDto } from './dto/find-jobs.dto'
import type { UpdateCandidateStatusDto } from './dto/update-candidate-status.dto'
import type { UpdateDepartmentDto } from './dto/update-department.dto'
import type { UpdateJobDto } from './dto/update-job.dto'

@Injectable()
export class RecruitmentService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Departments ─────────────────────────────────────────────────────────────

  findAllDepartments() {
    return this.prisma.db.department.findMany({ orderBy: { name: 'asc' } })
  }

  async createDepartment(dto: CreateDepartmentDto) {
    const existing = await this.prisma.db.department.findUnique({ where: { name: dto.name } })
    if (existing) throw new BadRequestException(`Department "${dto.name}" already exists`)
    return this.prisma.db.department.create({ data: dto })
  }

  async updateDepartment(id: number, dto: UpdateDepartmentDto) {
    await this.findDepartmentOrFail(id)
    return this.prisma.db.department.update({ where: { id }, data: dto })
  }

  async removeDepartment(id: number) {
    await this.findDepartmentOrFail(id)
    await this.prisma.db.department.delete({ where: { id } })
  }

  private async findDepartmentOrFail(id: number) {
    const dept = await this.prisma.db.department.findUnique({ where: { id } })
    if (!dept) throw new NotFoundException(`Department #${id} not found`)
    return dept
  }

  // ── Jobs ────────────────────────────────────────────────────────────────────

  async findAllJobsPublic({ page = 1, limit = 20, type, level, departmentId }: FindJobsDto) {
    const skip = (page - 1) * limit
    const where = {
      status: JobStatus.OPEN,
      deletedAt: null,
      ...(type && { type }),
      ...(level && { level }),
      ...(departmentId && { departmentId }),
    }
    const [data, total] = await Promise.all([
      this.prisma.db.job.findMany({
        where,
        skip,
        take: limit,
        include: { department: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.db.job.count({ where }),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findJobBySlugPublic(slug: string) {
    const job = await this.prisma.db.job.findFirst({
      where: { slug, status: JobStatus.OPEN, deletedAt: null },
      include: { department: true },
    })
    if (!job) throw new NotFoundException(`Job not found`)
    return job
  }

  async findAllJobsAdmin({ page = 1, limit = 20, status, type, level, departmentId }: FindJobsDto) {
    const skip = (page - 1) * limit
    const where = {
      deletedAt: null,
      ...(status && { status }),
      ...(type && { type }),
      ...(level && { level }),
      ...(departmentId && { departmentId }),
    }
    const [data, total] = await Promise.all([
      this.prisma.db.job.findMany({
        where,
        skip,
        take: limit,
        include: { department: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.db.job.count({ where }),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findJobByIdAdmin(id: number) {
    const job = await this.prisma.db.job.findUnique({ where: { id }, include: { department: true } })
    if (!job) throw new NotFoundException(`Job #${id} not found`)
    return job
  }

  async createJob(dto: CreateJobDto) {
    const slug = await this.generateUniqueJobSlug(dto.title)
    const { deadline, ...rest } = dto
    return this.prisma.db.job.create({
      data: { ...rest, slug, ...(deadline && { deadline: new Date(deadline) }) },
      include: { department: true },
    })
  }

  async updateJob(id: number, dto: UpdateJobDto) {
    await this.findJobByIdAdmin(id)
    const { deadline, ...rest } = dto
    const slug = rest.title ? await this.generateUniqueJobSlug(rest.title, id) : undefined
    return this.prisma.db.job.update({
      where: { id },
      data: {
        ...rest,
        ...(slug && { slug }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      },
      include: { department: true },
    })
  }

  async softDeleteJob(id: number) {
    await this.findJobByIdAdmin(id)
    return this.prisma.db.job.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  async restoreJob(id: number) {
    const job = await this.prisma.unfiltered.job.findUnique({ where: { id } })
    if (!job) throw new NotFoundException(`Job #${id} not found`)
    return this.prisma.unfiltered.job.update({ where: { id }, data: { deletedAt: null } })
  }

  async hardDeleteJob(id: number) {
    const job = await this.prisma.unfiltered.job.findUnique({ where: { id } })
    if (!job) throw new NotFoundException(`Job #${id} not found`)
    await this.prisma.unfiltered.job.delete({ where: { id } })
  }

  private async generateUniqueJobSlug(title: string, excludeId?: number): Promise<string> {
    const base = slugify(title, { lower: true, strict: true })
    let slug = base
    let count = 1
    while (true) {
      const existing = await this.prisma.db.job.findFirst({
        where: { slug, ...(excludeId && { id: { not: excludeId } }) },
      })
      if (!existing) break
      slug = `${base}-${count++}`
    }
    return slug
  }

  // ── Candidates ──────────────────────────────────────────────────────────────

  async findAllCandidates({ page = 1, limit = 20, jobId, departmentId, status }: FindCandidatesDto) {
    const skip = (page - 1) * limit
    const where = {
      ...(jobId && { jobId }),
      ...(status && { status }),
      ...(departmentId && { job: { departmentId } }),
    }
    const [data, total] = await Promise.all([
      this.prisma.db.candidate.findMany({
        where,
        skip,
        take: limit,
        include: { job: { include: { department: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.db.candidate.count({ where }),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOneCandidate(id: number) {
    const candidate = await this.prisma.db.candidate.findUnique({
      where: { id },
      include: { job: { include: { department: true } } },
    })
    if (!candidate) throw new NotFoundException(`Candidate #${id} not found`)
    return candidate
  }

  async createCandidate(
    jobId: number,
    cvUrl: string,
    data: { fullName: string; email: string; phone?: string; coverLetter?: string }
  ) {
    const job = await this.prisma.db.job.findFirst({ where: { id: jobId, status: JobStatus.OPEN, deletedAt: null } })
    if (!job) throw new NotFoundException(`Job #${jobId} not found or not open`)
    return this.prisma.db.candidate.create({ data: { jobId, cvUrl, ...data } })
  }

  async updateCandidateStatus(id: number, dto: UpdateCandidateStatusDto) {
    await this.findOneCandidate(id)
    return this.prisma.db.candidate.update({ where: { id }, data: { status: dto.status } })
  }
}
