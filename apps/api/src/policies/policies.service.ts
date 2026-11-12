import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreatePolicyDto {
  departmentId?: string;
  minimumAttendancePercent?: number;
  lateThresholdMinutes?: number;
  attendanceWindowMinutes?: number;
  isDefault?: boolean;
}

export interface UpdatePolicyDto extends Partial<CreatePolicyDto> {}

@Injectable()
export class PoliciesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.attendancePolicy.findMany({
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findDefault() {
    return this.prisma.attendancePolicy.findFirst({
      where: { isDefault: true },
      include: { department: true },
    });
  }

  async findByDepartment(departmentId: string) {
    const policy = await this.prisma.attendancePolicy.findFirst({
      where: { departmentId },
      include: { department: true },
    });
    if (!policy) {
      return this.findDefault();
    }
    return policy;
  }

  async findOne(id: string) {
    const policy = await this.prisma.attendancePolicy.findUnique({
      where: { id },
      include: { department: true },
    });
    if (!policy) throw new NotFoundException(`Policy ${id} not found`);
    return policy;
  }

  async create(dto: CreatePolicyDto) {
    if (dto.isDefault) {
      await this.prisma.attendancePolicy.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.attendancePolicy.create({
      data: {
        departmentId: dto.departmentId,
        minimumAttendancePercent: dto.minimumAttendancePercent ?? 75,
        lateThresholdMinutes: dto.lateThresholdMinutes ?? 15,
        attendanceWindowMinutes: dto.attendanceWindowMinutes ?? 30,
        isDefault: dto.isDefault ?? false,
      },
      include: { department: true },
    });
  }

  async update(id: string, dto: UpdatePolicyDto) {
    await this.findOne(id);
    if (dto.isDefault) {
      await this.prisma.attendancePolicy.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.attendancePolicy.update({
      where: { id },
      data: dto,
      include: { department: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.attendancePolicy.delete({ where: { id } });
  }
}

