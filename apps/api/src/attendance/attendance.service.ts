import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  ScanQrDto,
  ManualAttendanceDto,
  CorrectionRequestDto,
} from './dto/attendance.dto';
import {
  AttendanceStatus,
  AttendanceMethod,
  LectureSessionStatus,
} from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async scanQr(dto: ScanQrDto, studentUserId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found for this account');
    }

    const session = await this.prisma.lectureSession.findUnique({
      where: { id: dto.sessionId },
      include: {
        timetableSlot: {
          include: {
            courseAssignment: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!session || session.status !== LectureSessionStatus.ACTIVE) {
      throw new BadRequestException('Session is not active or does not exist');
    }

    // Verify token validity
    const qrToken = await this.prisma.qRToken.findFirst({
      where: {
        sessionId: dto.sessionId,
        token: dto.token,
        isInvalidated: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!qrToken) {
      throw new BadRequestException('QR token has expired or is invalid. Please scan the current code.');
    }

    // Determine if student is on time or late based on lateThresholdMinutes
    const now = new Date();
    const sessionStart = session.lecturerCheckInAt || session.createdAt;
    const diffMinutes = (now.getTime() - sessionStart.getTime()) / (1000 * 60);

    const status =
      diffMinutes > session.lateThresholdMinutes
        ? AttendanceStatus.LATE
        : AttendanceStatus.PRESENT;

    const record = await this.prisma.attendanceRecord.upsert({
      where: {
        sessionId_studentId: {
          sessionId: dto.sessionId,
          studentId: student.id,
        },
      },
      update: {
        status,
        method: AttendanceMethod.QR_CODE,
        recordedAt: now,
      },
      create: {
        sessionId: dto.sessionId,
        studentId: student.id,
        status,
        method: AttendanceMethod.QR_CODE,
        recordedAt: now,
      },
      include: {
        student: { include: { user: true } },
      },
    });

    return {
      record,
      courseName: session.timetableSlot?.courseAssignment?.course?.name,
      message: `Attendance verified as ${status}`,
    };
  }

  async recordManual(dto: ManualAttendanceDto, verifierUserId: string) {
    const session = await this.prisma.lectureSession.findUnique({
      where: { id: dto.sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const record = await this.prisma.attendanceRecord.upsert({
      where: {
        sessionId_studentId: {
          sessionId: dto.sessionId,
          studentId: dto.studentId,
        },
      },
      update: {
        status: dto.status,
        method: AttendanceMethod.MANUAL,
        notes: dto.notes,
        verifiedById: verifierUserId,
        verifiedAt: new Date(),
      },
      create: {
        sessionId: dto.sessionId,
        studentId: dto.studentId,
        status: dto.status,
        method: AttendanceMethod.MANUAL,
        notes: dto.notes,
        verifiedById: verifierUserId,
        verifiedAt: new Date(),
      },
      include: {
        student: { include: { user: true } },
      },
    });

    return record;
  }

  async findBySession(sessionId: string) {
    return this.prisma.attendanceRecord.findMany({
      where: { sessionId },
      include: {
        student: {
          include: {
            user: true,
            programme: true,
          },
        },
      },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async findByStudent(studentUserId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });

    if (!student) {
      return { summary: { total: 0, present: 0, late: 0, absent: 0, excused: 0, rate: 0 }, records: [] };
    }

    const records = await this.prisma.attendanceRecord.findMany({
      where: { studentId: student.id },
      include: {
        session: {
          include: {
            timetableSlot: {
              include: {
                courseAssignment: {
                  include: { course: true, lecturer: { include: { user: true } } },
                },
              },
            },
          },
        },
      },
      orderBy: { recordedAt: 'desc' },
    });

    const present = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const late = records.filter((r) => r.status === AttendanceStatus.LATE).length;
    const excused = records.filter((r) => r.status === AttendanceStatus.EXCUSED).length;
    const absent = records.filter((r) => r.status === AttendanceStatus.ABSENT).length;
    const total = records.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return {
      summary: { total, present, late, absent, excused, rate },
      records,
    };
  }

  async updateRecord(id: string, status: AttendanceStatus, notes?: string) {
    return this.prisma.attendanceRecord.update({
      where: { id },
      data: {
        status,
        notes,
        method: AttendanceMethod.CORRECTION,
      },
    });
  }

  async requestCorrection(dto: CorrectionRequestDto, studentUserId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return this.prisma.correctionRequest.create({
      data: {
        attendanceRecordId: dto.attendanceRecordId,
        studentId: student.id,
        requestedStatus: dto.requestedStatus,
        reason: dto.reason,
        supportingEvidence: dto.supportingEvidence,
      },
    });
  }
}

