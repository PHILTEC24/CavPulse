import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PoliciesService, CreatePolicyDto, UpdatePolicyDto } from './policies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('policies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get()
  @ApiOperation({ summary: 'List all attendance policies' })
  findAll() {
    return this.policiesService.findAll();
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default attendance policy' })
  findDefault() {
    return this.policiesService.findDefault();
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Get policy by department' })
  findByDepartment(@Param('departmentId') departmentId: string) {
    return this.policiesService.findByDepartment(departmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get policy by id' })
  findOne(@Param('id') id: string) {
    return this.policiesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN)
  @ApiOperation({ summary: 'Create attendance policy' })
  create(@Body() dto: CreatePolicyDto) {
    return this.policiesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN)
  @ApiOperation({ summary: 'Update attendance policy' })
  update(@Param('id') id: string, @Body() dto: UpdatePolicyDto) {
    return this.policiesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete attendance policy' })
  remove(@Param('id') id: string) {
    return this.policiesService.remove(id);
  }
}

