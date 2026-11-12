import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { StartSessionDto, SessionQueryDto } from './dto/session.dto';
import { LectureSessionStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async startSession(dto: StartSessionDto, lecturerUserId: string) {
    const slot = await this.prisma.timetableSlot.findUnique({
      where: { id: dto.timetableSlotId },
      include: {
        courseAssignment: {
          include: { lecturer: true, course: true },
        },
      },
    });

    if (!slot) {
      throw new NotFoundException('Timetable slot not found');
    }

    const sessionDate = new Date(dto.date);

    // Upsert or create session
    let session = await this.prisma.lectureSession.findFirst({
      where: {
        timetableSlotId: dto.timetableSlotId,
        date: sessionDate,
      },
    });

    if (!session) {
      session = await this.prisma.lectureSession.create({
        data: {
          timetableSlotId: dto.timetableSlotId,
          date: sessionDate,
          status: LectureSessionStatus.ACTIVE,
          lecturerCheckInAt: new Date(),
          attendanceWindowMinutes: dto.attendanceWindowMinutes || 30,
          lateThresholdMinutes: dto.lateThresholdMinutes || 15,
          notes: dto.notes,
        },
      });
    } else {
      session = await this.prisma.lectureSession.update({
        where: { id: session.id },
        data: {
          status: LectureSessionStatus.ACTIVE,
          lecturerCheckInAt: session.lecturerCheckInAt || new Date(),
        },
      });
    }

    // Generate initial QR token
    const token = await this.generateQrToken(session.id);

    return {
      session,
      qrToken: token,
    };
  }

  async findById(id: string) {
    const session = await this.prisma.lectureSession.findUnique({
      where: { id },
      include: {
        timetableSlot: {
          include: {
            courseAssignment: {
              include: {
                course: true,
                lecturer: { include: { user: true } },
                registrations: {
                  include: {
                    student: { include: { user: true } },
                  },
                },
              },
            },
          },
        },
        attendanceRecords: {
          include: {
            student: { include: { user: true } },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Lecture session ${id} not found`);
    }

    return session;
  }

  async findAll(query: SessionQueryDto) {
    const where: any = {};
    if (query.timetableSlotId) where.timetableSlotId = query.timetableSlotId;
    if (query.status) where.status = query.status as LectureSessionStatus;
    if (query.date) where.date = new Date(query.date);

    return this.prisma.lectureSession.findMany({
      where,
      include: {
        timetableSlot: {
          include: {
            courseAssignment: {
              include: {
                course: true,
                lecturer: { include: { user: true } },
              },
            },
          },
        },
        _count: {
          select: { attendanceRecords: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async closeSession(id: string) {
    const session = await this.prisma.lectureSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException(`Session ${id} not found`);
    }

    const updated = await this.prisma.lectureSession.update({
      where: { id },
      data: {
        status: LectureSessionStatus.CLOSED,
        lecturerCheckOutAt: new Date(),
      },
    });

    // Invalidate tokens in Redis
    try {
      await this.redis.del(`qr:${id}`);
    } catch {}

    return updated;
  }

  async generateQrToken(sessionId: string) {
    const randomHex = crypto.randomBytes(16).toString('hex');
    const token = `CUU-${sessionId.slice(-6)}-${randomHex}`;
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60s

    await this.prisma.qRToken.create({
      data: {
        sessionId,
        token,
        expiresAt,
        refreshIntervalSeconds: 55,
      },
    });

    try {
      await this.redis.set(`qr:${sessionId}`, token, 60);
    } catch {}

    return {
      token,
      expiresAt: expiresAt.toISOString(),
      refreshIntervalSeconds: 55,
    };
  }
}

