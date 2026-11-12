import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';

export class ScanQrDto {
  @ApiProperty({ description: 'QR token string from the QR code' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'ID of the lecture session' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}

export class ManualAttendanceDto {
  @ApiProperty({ description: 'ID of the lecture session' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ description: 'ID of the student profile' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ enum: AttendanceStatus, description: 'Attendance status to record' })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({ description: 'Optional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CorrectionRequestDto {
  @ApiProperty({ description: 'ID of the attendance record to correct' })
  @IsString()
  @IsNotEmpty()
  attendanceRecordId: string;

  @ApiProperty({ enum: AttendanceStatus, description: 'The status being requested' })
  @IsEnum(AttendanceStatus)
  requestedStatus: AttendanceStatus;

  @ApiProperty({ description: 'Reason for the correction request' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'URL or description of supporting evidence' })
  @IsString()
  @IsOptional()
  supportingEvidence?: string;
}

export class ReviewCorrectionDto {
  @ApiProperty({ description: 'ID of the correction request' })
  @IsString()
  @IsNotEmpty()
  correctionId: string;

  @ApiProperty({ enum: ['APPROVED', 'REJECTED'], description: 'Review decision' })
  @IsEnum(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ description: 'Reviewer notes' })
  @IsString()
  @IsOptional()
  reviewNotes?: string;
}
