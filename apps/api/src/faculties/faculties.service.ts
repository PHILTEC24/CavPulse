import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacultiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.faculty.findMany({
      include: {
        departments: {
          include: {
            programmes: true,
            _count: { select: { lecturers: true, courses: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id },
      include: {
        departments: {
          include: {
            programmes: true,
            headOfDepartment: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });
    if (!faculty) throw new NotFoundException(`Faculty ${id} not found`);
    return faculty;
  }

  async create(data: { name: string; code: string; description?: string }) {
    return this.prisma.faculty.create({ data });
  }

  async update(id: string, data: { name?: string; code?: string; description?: string; isActive?: boolean }) {
    await this.findOne(id);
    return this.prisma.faculty.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.faculty.delete({ where: { id } });
  }
}

