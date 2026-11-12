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
import { TimetableService } from './timetable.service';
import { CreateTimetableSlotDto, UpdateTimetableSlotDto, TimetableQueryDto, ConflictCheckQueryDto } from './dto/timetable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('timetable')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get()
  @ApiOperation({ summary: 'List timetable slots' })
  findAll(@Query() query: TimetableQueryDto) {
    return this.timetableService.findAll(query);
  }

  @Post('check-conflict')
  @ApiOperation({ summary: 'Check if a timetable slot conflicts' })
  checkConflict(@Body() dto: ConflictCheckQueryDto) {
    return this.timetableService.checkConflict(dto);
  }

  @Get('my-schedule')
  @ApiOperation({ summary: 'Get timetable for currently logged in student or lecturer' })
  getMySchedule(@CurrentUser() user: any) {
    if (user.role === UserRole.STUDENT) {
      return this.timetableService.findByStudent(user.id);
    }
    return this.timetableService.findByLecturer(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get timetable slot by id' })
  findOne(@Param('id') id: string) {
    return this.timetableService.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN, UserRole.HEAD_OF_DEPARTMENT)
  @ApiOperation({ summary: 'Create timetable slot' })
  create(@Body() dto: CreateTimetableSlotDto) {
    return this.timetableService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN, UserRole.HEAD_OF_DEPARTMENT)
  @ApiOperation({ summary: 'Update timetable slot' })
  update(@Param('id') id: string, @Body() dto: UpdateTimetableSlotDto) {
    return this.timetableService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN)
  @ApiOperation({ summary: 'Delete timetable slot' })
  remove(@Param('id') id: string) {
    return this.timetableService.remove(id);
  }
}

