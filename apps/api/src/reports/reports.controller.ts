import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get session attendance report' })
  getSessionReport(@Param('sessionId') sessionId: string) {
    return this.reportsService.getSessionReport(sessionId);
  }

  @Get('course/:courseAssignmentId')
  @ApiOperation({ summary: 'Get course attendance report with exam eligibility' })
  getCourseReport(@Param('courseAssignmentId') courseAssignmentId: string) {
    return this.reportsService.getCourseReport(courseAssignmentId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get student attendance report' })
  getStudentReport(
    @Param('studentId') studentId: string,
    @Query('semesterId') semesterId?: string,
  ) {
    return this.reportsService.getStudentReport(studentId, semesterId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get report for current student' })
  getMyReport(@CurrentUser() user: any, @Query('semesterId') semesterId?: string) {
    return this.reportsService.getStudentReport(user.studentProfile.id, semesterId);
  }
}

