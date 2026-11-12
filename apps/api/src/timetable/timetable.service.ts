import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimetableSlotDto, UpdateTimetableSlotDto, TimetableQueryDto, ConflictCheckQueryDto } from './dto/timetable.dto';

@Injectable()
export class TimetableService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: TimetableQueryDto) {
    const where: any = {};
    if (query.courseAssignmentId) where.courseAssignmentId = query.courseAssignmentId;
    if (query.day) where.dayOfWeek = query.day;
    if (query.semesterId) {
      where.courseAssignment = { semesterId: query.semesterId };
    }

    return this.prisma.timetableSlot.findMany({
      where,
      include: {
        courseAssignment: {
          include: {
            course: true,
            lecturer: { include: { user: true } },
            semester: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(id: string) {
    const slot = await this.prisma.timetableSlot.findUnique({
      where: { id },
      include: {
        courseAssignment: {
          include: {
            course: true,
            lecturer: { include: { user: true } },
            semester: true,
          },
        },
      },
    });
    if (!slot) throw new NotFoundException(`Timetable slot ${id} not found`);
    return slot;
  }

  async checkConflict(dto: ConflictCheckQueryDto) {
    const overlapping = await this.prisma.timetableSlot.findFirst({
      where: {
        id: dto.excludeId ? { not: dto.excludeId } : undefined,
        dayOfWeek: dto.day,
        OR: [
          {
            startTime: { lte: dto.startTime },
            endTime: { gt: dto.startTime },
          },
          {
            startTime: { lt: dto.endTime },
            endTime: { gte: dto.endTime },
          },
        ],
        courseAssignmentId: dto.courseAssignmentId,
      },
    });

    return { hasConflict: !!overlapping, conflictingSlot: overlapping };
  }

  async create(dto: CreateTimetableSlotDto) {
    const conflict = await this.checkConflict({
      courseAssignmentId: dto.courseAssignmentId,
      day: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });

    if (conflict.hasConflict) {
      throw new ConflictException('Timetable slot conflicts with existing lecture time');
    }

    return this.prisma.timetableSlot.create({
      data: {
        courseAssignmentId: dto.courseAssignmentId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        room: dto.room,
        building: dto.building,
      },
      include: {
        courseAssignment: {
          include: { course: true, lecturer: { include: { user: true } } },
        },
      },
    });
  }

  async update(id: string, dto: UpdateTimetableSlotDto) {
    await this.findOne(id);
    return this.prisma.timetableSlot.update({
      where: { id },
      data: dto,
      include: {
        courseAssignment: {
          include: { course: true, lecturer: { include: { user: true } } },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.timetableSlot.delete({ where: { id } });
  }

  async findByLecturer(lecturerUserId: string) {
    const lecturer = await this.prisma.lecturerProfile.findUnique({
      where: { userId: lecturerUserId },
    });
    if (!lecturer) return [];

    return this.prisma.timetableSlot.findMany({
      where: { courseAssignment: { lecturerId: lecturer.id } },
      include: {
        courseAssignment: {
          include: { course: true, semester: true },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findByStudent(studentUserId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
      include: {
        registrations: { where: { isActive: true }, select: { courseAssignmentId: true } },
      },
    });
    if (!student) return [];

    const caIds = student.registrations.map((r) => r.courseAssignmentId);
    return this.prisma.timetableSlot.findMany({
      where: { courseAssignmentId: { in: caIds } },
      include: {
        courseAssignment: {
          include: { course: true, lecturer: { include: { user: true } } },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }
}

