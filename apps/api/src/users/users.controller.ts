import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService, PaginationQuery, StudentQuery, LecturerQuery } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdatePasswordDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN)
  @ApiOperation({ summary: 'Create new user' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN)
  @ApiOperation({ summary: 'List all users paginated' })
  findAll(@Query() query: PaginationQuery) {
    return this.usersService.findAll(query);
  }

  @Get('students')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN, UserRole.HEAD_OF_DEPARTMENT, UserRole.LECTURER)
  @ApiOperation({ summary: 'List students' })
  findStudents(@Query() query: StudentQuery) {
    return this.usersService.findStudents(query);
  }

  @Get('lecturers')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN, UserRole.HEAD_OF_DEPARTMENT)
  @ApiOperation({ summary: 'List lecturers' })
  findLecturers(@Query() query: LecturerQuery) {
    return this.usersService.findLecturers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Update user password' })
  updatePassword(
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto,
    @CurrentUser() user: User
  ) {
    return this.usersService.updatePassword(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deactivate user' })
  remove(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }
}

