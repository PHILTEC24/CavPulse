import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FacultiesService } from './faculties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('faculties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Get()
  @ApiOperation({ summary: 'List all faculties' })
  findAll() {
    return this.facultiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get faculty by id' })
  findOne(@Param('id') id: string) {
    return this.facultiesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create faculty' })
  create(@Body() body: { name: string; code: string; description?: string }) {
    return this.facultiesService.create(body);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update faculty' })
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; code?: string; description?: string; isActive?: boolean },
  ) {
    return this.facultiesService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete faculty' })
  remove(@Param('id') id: string) {
    return this.facultiesService.remove(id);
  }
}

