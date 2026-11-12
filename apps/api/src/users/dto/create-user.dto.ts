import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@cavendish.ac.ug' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: '+256700000000' })
  @IsString()
  @IsOptional()
  phone?: string;

  // ── Student-only fields ──────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 'STU-2024-0001' })
  @ValidateIf((o) => o.role === UserRole.STUDENT)
  @IsString()
  @IsNotEmpty()
  studentNumber?: string;

  @ApiPropertyOptional({ example: 'clxyz123programmeId' })
  @ValidateIf((o) => o.role === UserRole.STUDENT)
  @IsString()
  @IsNotEmpty()
  programmeId?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 6 })
  @ValidateIf((o) => o.role === UserRole.STUDENT)
  @IsInt()
  @Min(1)
  @Max(6)
  yearOfStudy?: number;

  // ── Lecturer-only fields ─────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 'LEC-2024-0001' })
  @ValidateIf((o) => o.role === UserRole.LECTURER)
  @IsString()
  @IsNotEmpty()
  staffNumber?: string;

  @ApiPropertyOptional({ example: 'clxyz123departmentId' })
  @ValidateIf((o) => o.role === UserRole.LECTURER || o.role === UserRole.HEAD_OF_DEPARTMENT)
  @IsString()
  @IsNotEmpty()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'Dr.' })
  @ValidateIf((o) => o.role === UserRole.LECTURER || o.role === UserRole.HEAD_OF_DEPARTMENT)
  @IsString()
  @IsOptional()
  title?: string;
}
