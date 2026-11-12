import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { ScanQrDto, ManualAttendanceDto, CorrectionRequestDto } from './dto/attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, AttendanceStatus } from '@prisma/client';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('scan')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Scan dynamic QR code to mark attendance' })
  scanQr(@Body() dto: ScanQrDto, @CurrentUser() user: any) {
    return this.attendanceService.scanQr(dto, user.id);
  }

  @Post('manual')
  @Roles(UserRole.LECTURER, UserRole.HEAD_OF_DEPARTMENT, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Manually record student attendance' })
  recordManual(@Body() dto: ManualAttendanceDto, @CurrentUser() user: any) {
    return this.attendanceService.recordManual(dto, user.id);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get all attendance records for a session' })
  findBySession(@Param('sessionId') sessionId: string) {
    return this.attendanceService.findBySession(sessionId);
  }

  @Get('my-attendance')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get current student attendance history' })
  getMyAttendance(@CurrentUser() user: any) {
    return this.attendanceService.findByStudent(user.id);
  }

  @Patch(':id')
  @Roles(UserRole.LECTURER, UserRole.HEAD_OF_DEPARTMENT, UserRole.ACADEMIC_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update attendance record status' })
  updateRecord(
    @Param('id') id: string,
    @Body('status') status: AttendanceStatus,
    @Body('notes') notes?: string,
  ) {
    return this.attendanceService.updateRecord(id, status, notes);
  }

  @Post('correction')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Submit an attendance correction request' })
  requestCorrection(@Body() dto: CorrectionRequestDto, @CurrentUser() user: any) {
    return this.attendanceService.requestCorrection(dto, user.id);
  }
}

