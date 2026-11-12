import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class StartSessionDto {
  @ApiProperty({ description: 'ID of the timetable slot' })
  @IsString()
  @IsNotEmpty()
  timetableSlotId: string;

  @ApiProperty({ description: 'Session date (YYYY-MM-DD)', example: '2026-11-10' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'Minutes the attendance window remains open', default: 30 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  attendanceWindowMinutes?: number;

  @ApiPropertyOptional({ description: 'Minutes within which students are still on time', default: 15 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  lateThresholdMinutes?: number;

  @ApiPropertyOptional({ description: 'Optional lecturer notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class SessionQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  timetableSlotId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lecturerId?: string;

  @ApiPropertyOptional({ example: '2026-11-10' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ description: 'Session status filter' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
