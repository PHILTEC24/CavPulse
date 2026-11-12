import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '+256700000000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  // Student profile updates
  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 6 })
  @IsInt()
  @Min(1)
  @Max(6)
  @IsOptional()
  yearOfStudy?: number;

  @ApiPropertyOptional({ example: 'clxyz123programmeId' })
  @IsString()
  @IsOptional()
  programmeId?: string;

  // Lecturer profile updates
  @ApiPropertyOptional({ example: 'Dr.' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Machine Learning' })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiPropertyOptional({ example: 'clxyz123departmentId' })
  @IsString()
  @IsOptional()
  departmentId?: string;
}

export class UpdatePasswordDto {
  @ApiPropertyOptional({ example: 'OldPass123!' })
  @IsString()
  currentPassword: string;

  @ApiPropertyOptional({ example: 'NewPass456!', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
