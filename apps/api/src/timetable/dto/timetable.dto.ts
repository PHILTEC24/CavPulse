import {
  IsString,
  IsEnum,
  IsOptional,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { DayOfWeek } from '@prisma/client';

export class CreateTimetableSlotDto {
  @ApiProperty({ description: 'ID of the course assignment' })
  @IsString()
  @IsNotEmpty()
  courseAssignmentId: string;

  @ApiProperty({ enum: DayOfWeek, description: 'Day of the week' })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: 'Start time in HH:MM format', example: '08:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime: string;

  @ApiProperty({ description: 'End time in HH:MM format', example: '10:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:MM format',
  })
  endTime: string;

  @ApiProperty({ description: 'Room identifier', example: 'LT-101' })
  @IsString()
  @IsNotEmpty()
  room: string;

  @ApiPropertyOptional({ description: 'Building name', example: 'Main Block' })
  @IsString()
  @IsOptional()
  building?: string;
}

export class UpdateTimetableSlotDto extends PartialType(CreateTimetableSlotDto) {}

export class TimetableQueryDto {
  @ApiPropertyOptional({ description: 'Filter by course assignment ID' })
  @IsString()
  @IsOptional()
  courseAssignmentId?: string;

  @ApiPropertyOptional({ enum: DayOfWeek, description: 'Filter by day' })
  @IsEnum(DayOfWeek)
  @IsOptional()
  day?: DayOfWeek;

  @ApiPropertyOptional({ description: 'Filter by semester ID' })
  @IsString()
  @IsOptional()
  semesterId?: string;
}

export class ConflictCheckQueryDto {
  @ApiProperty({ description: 'Course assignment ID' })
  @IsString()
  @IsNotEmpty()
  courseAssignmentId: string;

  @ApiProperty({ enum: DayOfWeek })
  @IsEnum(DayOfWeek)
  day: DayOfWeek;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime: string;

  @ApiPropertyOptional({ description: 'Exclude a slot ID when checking (for updates)' })
  @IsString()
  @IsOptional()
  excludeId?: string;
}
