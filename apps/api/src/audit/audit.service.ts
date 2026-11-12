import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ExpressRequestLike {
  headers: Record<string, any>;
  socket?: { remoteAddress?: string };
}

interface AuditQuery {
  userId?: string;
  entity?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    userId: string,
    action: string,
    entity: string,
    entityId?: string,
    metadata?: Record<string, any>,
    request?: ExpressRequestLike,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata,
        ipAddress: request
          ? (request.headers['x-forwarded-for'] as string) ||
            request.socket?.remoteAddress
          : undefined,
        userAgent: request ? request.headers['user-agent'] : undefined,
      },
    });
  }

  async findAll(query: AuditQuery) {
    const {
      userId,
      entity,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (userId) where.userId = userId;
    if (entity) where.entity = { contains: entity, mode: 'insensitive' };
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
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

  async findById(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, role: true },
        },
      },
    });
  }

  async getUserActivity(userId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true, role: true },
    });

    // Aggregate by entity and action
    const entityBreakdown: Record<string, number> = {};
    const actionBreakdown: Record<string, number> = {};
    for (const log of logs) {
      entityBreakdown[log.entity] = (entityBreakdown[log.entity] ?? 0) + 1;
      actionBreakdown[log.action] = (actionBreakdown[log.action] ?? 0) + 1;
    }

    return {
      user,
      totalActions: logs.length,
      entityBreakdown,
      actionBreakdown,
      recentActivity: logs.slice(0, 20),
    };
  }
}
