import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(facultyId?: string) {
    return this.prisma.department.findMany({
      where: facultyId ? { facultyId } : undefined,
      include: {
        faculty: true,
        headOfDepartment: { select: { firstName: true, lastName: true, email: true } },
        programmes: true,
        _count: { select: { courses: true, lecturers: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: {
        faculty: true,
        headOfDepartment: { select: { firstName: true, lastName: true, email: true } },
        programmes: true,
        courses: true,
        lecturers: { include: { user: true } },
      },
    });
    if (!dept) throw new NotFoundException(`Department ${id} not found`);
    return dept;
  }

  async create(data: { name: string; code: string; facultyId: string; headOfDepartmentId?: string }) {
    return this.prisma.department.create({
      data,
      include: { faculty: true },
    });
  }

  async update(id: string, data: { name?: string; code?: string; facultyId?: string; headOfDepartmentId?: string; isActive?: boolean }) {
    await this.findOne(id);
    return this.prisma.department.update({
      where: { id },
      data,
      include: { faculty: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.department.delete({ where: { id } });
  }
}

