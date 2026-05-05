import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  PERM_DEPARTMENTS_DELETE,
  PERM_DEPARTMENTS_READ,
  PERM_DEPARTMENTS_UPDATE,
  PERM_DEPARTMENTS_WRITE,
} from '~/common/constants/permissions'
import { ApiWrappedResponse } from '~/common/decorators/api-response.decorator'
import { RequirePermissions } from '~/common/decorators/require-permissions.decorator'
import { JwtAuthGuard } from '~/common/guards/jwt-auth.guard'
import { PermissionsGuard } from '~/common/guards/permissions.guard'
import { CreateDepartmentDto } from '../dto/create-department.dto'
import { DepartmentResponseDto } from '../dto/department-response.dto'
import { UpdateDepartmentDto } from '../dto/update-department.dto'
import { RecruitmentService } from '../recruitment.service'

@ApiTags('Admin Departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/departments')
export class AdminDepartmentsController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get()
  @RequirePermissions(PERM_DEPARTMENTS_READ)
  @ApiOperation({ summary: 'List all departments' })
  @ApiWrappedResponse(DepartmentResponseDto, { isArray: true })
  findAll() {
    return this.recruitmentService.findAllDepartments()
  }

  @Post()
  @RequirePermissions(PERM_DEPARTMENTS_WRITE)
  @ApiOperation({ summary: 'Create a department' })
  @ApiWrappedResponse(DepartmentResponseDto, { status: 201 })
  create(@Body() dto: CreateDepartmentDto) {
    return this.recruitmentService.createDepartment(dto)
  }

  @Patch(':id')
  @RequirePermissions(PERM_DEPARTMENTS_UPDATE)
  @ApiOperation({ summary: 'Update a department' })
  @ApiWrappedResponse(DepartmentResponseDto)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDepartmentDto) {
    return this.recruitmentService.updateDepartment(id, dto)
  }

  @Delete(':id')
  @RequirePermissions(PERM_DEPARTMENTS_DELETE)
  @ApiOperation({ summary: 'Delete a department (jobs retain null departmentId)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.recruitmentService.removeDepartment(id)
    return null
  }
}
