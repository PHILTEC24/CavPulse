import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.academicYear.findMany({
      include: {
        semesters: {
          orderBy: { semesterNumber: 'asc' },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findCurrent() {
    return this.prisma.academicYear.findFirst({
      where: { isCurrent: true },
      include: {
        semesters: {
          where: { isCurrent: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const year = await this.prisma.academicYear.findUnique({
      where: { id },
      include: {
        semesters: {
          orderBy: { semesterNumber: 'asc' },
        },
      },
    });
    if (!year) throw new NotFoundException(`Academic year ${id} not found`);
    return year;
  }

  async create(data: { name: string; startDate: string; endDate: string; isCurrent?: boolean }) {
    if (data.isCurrent) {
      await this.prisma.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });
    }

    return this.prisma.academicYear.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isCurrent: data.isCurrent ?? false,
      },
      include: { semesters: true },
    });
  }

  async createSemester(
    academicYearId: string,
    data: { name: string; semesterNumber: number; startDate: string; endDate: string; isCurrent?: boolean },
  ) {
    if (data.isCurrent) {
      await this.prisma.semester.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });
    }

    return this.prisma.semester.create({
      data: {
        academicYearId,
        name: data.name,
        semesterNumber: data.semesterNumber,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isCurrent: data.isCurrent ?? false,
      },
    });
  }

  async update(id: string, data: { name?: string; startDate?: string; endDate?: string; isCurrent?: boolean }) {
    await this.findOne(id);
    if (data.isCurrent) {
      await this.prisma.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });
    }

    return this.prisma.academicYear.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.isCurrent !== undefined && { isCurrent: data.isCurrent }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.academicYear.delete({ where: { id } });
  }
}

