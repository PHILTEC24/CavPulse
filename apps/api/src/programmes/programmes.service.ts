import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgrammesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(departmentId?: string) {
    return this.prisma.programme.findMany({
      where: departmentId ? { departmentId } : undefined,
      include: {
        department: { include: { faculty: true } },
        _count: { select: { students: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const programme = await this.prisma.programme.findUnique({
      where: { id },
      include: {
        department: { include: { faculty: true } },
        students: {
          take: 50,
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
      },
    });
    if (!programme) throw new NotFoundException(`Programme ${id} not found`);
    return programme;
  }

  async create(data: { name: string; code: string; departmentId: string; durationYears: number; description?: string }) {
    return this.prisma.programme.create({
      data,
      include: { department: true },
    });
  }

  async update(
    id: string,
    data: { name?: string; code?: string; departmentId?: string; durationYears?: number; description?: string; isActive?: boolean },
  ) {
    await this.findOne(id);
    return this.prisma.programme.update({
      where: { id },
      data,
      include: { department: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.programme.delete({ where: { id } });
  }
}

