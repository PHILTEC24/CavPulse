import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List courses' })
  findAll(@Query('departmentId') departmentId?: string) {
    return this.coursesService.findAll(departmentId);
  }

  @Get('my-courses')
  @ApiOperation({ summary: 'Get courses for current student or lecturer' })
  getMyCourses(@CurrentUser() user: any) {
    if (user.role === UserRole.STUDENT) {
      return this.coursesService.getStudentCourses(user.id);
    }
    return this.coursesService.getLecturerCourses(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by id' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN, UserRole.HEAD_OF_DEPARTMENT)
  @ApiOperation({ summary: 'Create course' })
  create(
    @Body()
    body: {
      code: string;
      name: string;
      departmentId: string;
      credits?: number;
      yearLevel?: number;
      description?: string;
    },
  ) {
    return this.coursesService.create(body);
  }

  @Post('assign-lecturer')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN, UserRole.HEAD_OF_DEPARTMENT)
  @ApiOperation({ summary: 'Assign lecturer to course' })
  assignLecturer(@Body() body: { courseId: string; lecturerId: string; semesterId: string }) {
    return this.coursesService.assignLecturer(body);
  }

  @Post('register-student')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN)
  @ApiOperation({ summary: 'Register student to course assignment' })
  registerStudent(@Body() body: { studentId: string; courseAssignmentId: string }) {
    return this.coursesService.registerStudent(body);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN, UserRole.HEAD_OF_DEPARTMENT)
  @ApiOperation({ summary: 'Update course' })
  update(
    @Param('id') id: string,
    @Body()
    body: {
      code?: string;
      name?: string;
      departmentId?: string;
      credits?: number;
      yearLevel?: number;
      description?: string;
      isActive?: boolean;
    },
  ) {
    return this.coursesService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete course' })
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}

