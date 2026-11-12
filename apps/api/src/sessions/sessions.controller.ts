import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { StartSessionDto, SessionQueryDto } from './dto/session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '@prisma/client';

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('start')
  @Roles(UserRole.LECTURER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Start a lecture session' })
  start(@Body() dto: StartSessionDto, @CurrentUser() user: User) {
    return this.sessionsService.startSession(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Query sessions' })
  findAll(@Query() query: SessionQueryDto) {
    return this.sessionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session by id' })
  findById(@Param('id') id: string) {
    return this.sessionsService.findById(id);
  }

  @Post(':id/close')
  @Roles(UserRole.LECTURER, UserRole.SUPER_ADMIN, UserRole.HEAD_OF_DEPARTMENT)
  @ApiOperation({ summary: 'Close a lecture session' })
  close(@Param('id') id: string) {
    return this.sessionsService.closeSession(id);
  }

  @Get(':id/qr')
  @Roles(UserRole.LECTURER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Generate fresh QR code token for active session' })
  generateQr(@Param('id') id: string) {
    return this.sessionsService.generateQrToken(id);
  }
}

