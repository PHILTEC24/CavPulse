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
import { ProgrammesService } from './programmes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('programmes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('programmes')
export class ProgrammesController {
  constructor(private readonly programmesService: ProgrammesService) {}

  @Get()
  @ApiOperation({ summary: 'List programmes' })
  findAll(@Query('departmentId') departmentId?: string) {
    return this.programmesService.findAll(departmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get programme by id' })
  findOne(@Param('id') id: string) {
    return this.programmesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN)
  @ApiOperation({ summary: 'Create programme' })
  create(
    @Body() body: { name: string; code: string; departmentId: string; durationYears: number; description?: string },
  ) {
    return this.programmesService.create(body);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN)
  @ApiOperation({ summary: 'Update programme' })
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      code?: string;
      departmentId?: string;
      durationYears?: number;
      description?: string;
      isActive?: boolean;
    },
  ) {
    return this.programmesService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete programme' })
  remove(@Param('id') id: string) {
    return this.programmesService.remove(id);
  }
}

