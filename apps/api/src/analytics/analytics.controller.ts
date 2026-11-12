import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('institution')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN)
  @ApiOperation({ summary: 'Get institution-wide analytics' })
  getInstitutionAnalytics(@Query('semesterId') semesterId?: string) {
    return this.analyticsService.getInstitutionAnalytics(semesterId);
  }

  @Get('department/:departmentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN, UserRole.HEAD_OF_DEPARTMENT)
  @ApiOperation({ summary: 'Get department analytics' })
  getDepartmentAnalytics(
    @Param('departmentId') departmentId: string,
    @Query('semesterId') semesterId?: string,
  ) {
    return this.analyticsService.getDepartmentAnalytics(departmentId, semesterId);
  }

  @Get('course/:courseAssignmentId')
  @ApiOperation({ summary: 'Get course attendance analytics' })
  getCourseAnalytics(@Param('courseAssignmentId') courseAssignmentId: string) {
    return this.analyticsService.getCourseAnalytics(courseAssignmentId);
  }

  @Get('course/:courseAssignmentId/trend')
  @ApiOperation({ summary: 'Get course attendance trend' })
  getAttendanceTrend(
    @Param('courseAssignmentId') courseAssignmentId: string,
    @Query('weeks') weeks?: string,
  ) {
    return this.analyticsService.getAttendanceTrend(
      courseAssignmentId,
      weeks ? parseInt(weeks, 10) : 12,
    );
  }

  @Get('lecturer/:lecturerId')
  @ApiOperation({ summary: 'Get lecturer analytics' })
  getLecturerAnalytics(
    @Param('lecturerId') lecturerId: string,
    @Query('semesterId') semesterId?: string,
  ) {
    return this.analyticsService.getLecturerAnalytics(lecturerId, semesterId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get student attendance analytics' })
  getStudentAnalytics(
    @Param('studentId') studentId: string,
    @Query('semesterId') semesterId?: string,
  ) {
    return this.analyticsService.getStudentAnalytics(studentId, semesterId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get logged in user analytics' })
  getMyAnalytics(@CurrentUser() user: any, @Query('semesterId') semesterId?: string) {
    if (user.role === UserRole.STUDENT && user.studentProfile?.id) {
      return this.analyticsService.getStudentAnalytics(user.studentProfile.id, semesterId);
    }
    if ((user.role === UserRole.LECTURER || user.role === UserRole.HEAD_OF_DEPARTMENT) && user.lecturerProfile?.id) {
      return this.analyticsService.getLecturerAnalytics(user.lecturerProfile.id, semesterId);
    }
    return this.analyticsService.getInstitutionAnalytics(semesterId);
  }
}

