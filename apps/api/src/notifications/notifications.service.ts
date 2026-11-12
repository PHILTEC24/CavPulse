import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>,
  ) {
    return this.prisma.notification.create({
      data: { userId, type, title, message, metadata },
    });
  }

  async findAll(userId: string, isRead?: boolean, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = {
      userId,
      ...(isRead !== undefined ? { isRead } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification)
      throw new NotFoundException(`Notification ${id} not found`);

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { updated: result.count };
  }

  async delete(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification)
      throw new NotFoundException(`Notification ${id} not found`);

    await this.prisma.notification.delete({ where: { id } });
    return { message: 'Notification deleted successfully' };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  // ─── Domain-specific senders ──────────────────────────────────────────────

  async sendLowAttendanceAlert(
    studentId: string,
    courseName: string,
    rate: number,
  ) {
    // studentId here is StudentProfile.userId
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });
    if (!student) return;

    return this.create(
      student.userId,
      NotificationType.LOW_ATTENDANCE_ALERT,
      'Low Attendance Warning',
      `Your attendance in ${courseName} has dropped to ${rate}%. The minimum required is 75%. Please attend your classes.`,
      { courseName, rate, studentProfileId: studentId },
    );
  }

  async sendSessionStartedNotification(
    courseAssignmentId: string,
    sessionId: string,
  ) {
    const registrations = await this.prisma.courseRegistration.findMany({
      where: { courseAssignmentId, isActive: true },
      include: {
        student: { select: { userId: true } },
        courseAssignment: {
          include: { course: { select: { code: true, name: true } } },
        },
      },
    });

    const notifications = registrations.map((reg) =>
      this.create(
        reg.student.userId,
        NotificationType.SESSION_STARTED,
        'Lecture Session Started',
        `A lecture session for ${reg.courseAssignment.course.code} - ${reg.courseAssignment.course.name} has started. Mark your attendance now.`,
        { sessionId, courseAssignmentId },
      ),
    );

    await Promise.allSettled(notifications);
    return { sent: notifications.length };
  }
}
