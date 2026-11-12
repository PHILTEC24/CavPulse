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
import { AcademicYearsService } from './academic-years.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('academic-years')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  @Get()
  @ApiOperation({ summary: 'List academic years with semesters' })
  findAll() {
    return this.academicYearsService.findAll();
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current academic year and semester' })
  findCurrent() {
    return this.academicYearsService.findCurrent();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get academic year by id' })
  findOne(@Param('id') id: string) {
    return this.academicYearsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN)
  @ApiOperation({ summary: 'Create academic year' })
  create(@Body() body: { name: string; startDate: string; endDate: string; isCurrent?: boolean }) {
    return this.academicYearsService.create(body);
  }

  @Post(':id/semesters')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN)
  @ApiOperation({ summary: 'Create semester under academic year' })
  createSemester(
    @Param('id') id: string,
    @Body() body: { name: string; semesterNumber: number; startDate: string; endDate: string; isCurrent?: boolean },
  ) {
    return this.academicYearsService.createSemester(id, body);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN)
  @ApiOperation({ summary: 'Update academic year' })
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; startDate?: string; endDate?: string; isCurrent?: boolean },
  ) {
    return this.academicYearsService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete academic year' })
  remove(@Param('id') id: string) {
    return this.academicYearsService.remove(id);
  }
}

