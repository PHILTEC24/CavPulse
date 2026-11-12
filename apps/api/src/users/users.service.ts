import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface StudentQuery extends PaginationQuery {
  programmeId?: string;
  yearOfStudy?: number;
}

export interface LecturerQuery extends PaginationQuery {
  departmentId?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers ────────────────────────────────────────────────────────────────

  private buildPaginationMeta(total: number, page: number, limit: number) {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── findAll ────────────────────────────────────────────────────────────────

  async findAll(query: PaginationQuery) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where = query.search
      ? {
          OR: [
            { firstName: { contains: query.search, mode: 'insensitive' as const } },
            { lastName: { contains: query.search, mode: 'insensitive' as const } },
            { email: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          phone: true,
          avatarUrl: true,
          lastLoginAt: true,
          createdAt: true,
          studentProfile: {
            select: { studentNumber: true, yearOfStudy: true, programme: { select: { name: true, code: true } } },
          },
          lecturerProfile: {
            select: { staffNumber: true, title: true, department: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, meta: this.buildPaginationMeta(total, page, limit) };
  }

  async findById(id: string) {
    return this.findOne(id);
  }

  // ── findOne ────────────────────────────────────────────────────────────────

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        phone: true,
        avatarUrl: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        studentProfile: {
          include: { programme: { include: { department: true } } },
        },
        lecturerProfile: {
          include: { department: { include: { faculty: true } } },
        },
      },
    });

    if (!user) throw new NotFoundException(`User with id "${id}" not found`);
    return user;
  }

  // ── create ─────────────────────────────────────────────────────────────────

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException(`Email "${dto.email}" is already in use`);

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        password: hashedPassword,
        phone: dto.phone,
      },
    });

    // Create role-specific profile
    if (dto.role === UserRole.STUDENT) {
      if (!dto.studentNumber || !dto.programmeId || dto.yearOfStudy === undefined) {
        throw new BadRequestException(
          'studentNumber, programmeId and yearOfStudy are required for STUDENT role',
        );
      }

      const existingStudent = await this.prisma.studentProfile.findUnique({
        where: { studentNumber: dto.studentNumber },
      });
      if (existingStudent) {
        await this.prisma.user.delete({ where: { id: user.id } });
        throw new ConflictException(`Student number "${dto.studentNumber}" already exists`);
      }

      await this.prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentNumber: dto.studentNumber,
          programmeId: dto.programmeId,
          yearOfStudy: dto.yearOfStudy,
        },
      });
    }

    if (dto.role === UserRole.LECTURER || dto.role === UserRole.HEAD_OF_DEPARTMENT) {
      if (!dto.staffNumber || !dto.departmentId) {
        throw new BadRequestException(
          'staffNumber and departmentId are required for LECTURER/HEAD_OF_DEPARTMENT role',
        );
      }

      const existingLecturer = await this.prisma.lecturerProfile.findUnique({
        where: { staffNumber: dto.staffNumber },
      });
      if (existingLecturer) {
        await this.prisma.user.delete({ where: { id: user.id } });
        throw new ConflictException(`Staff number "${dto.staffNumber}" already exists`);
      }

      await this.prisma.lecturerProfile.create({
        data: {
          userId: user.id,
          staffNumber: dto.staffNumber,
          departmentId: dto.departmentId,
          title: dto.title,
        },
      });
    }

    return this.findOne(user.id);
  }

  // ── update ─────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    const { yearOfStudy, programmeId, title, specialization, departmentId, ...userFields } = dto;

    await this.prisma.user.update({
      where: { id },
      data: userFields,
    });

    // Update student profile if relevant fields present
    if (yearOfStudy !== undefined || programmeId !== undefined) {
      await this.prisma.studentProfile.updateMany({
        where: { userId: id },
        data: { ...(yearOfStudy !== undefined && { yearOfStudy }), ...(programmeId && { programmeId }) },
      });
    }

    // Update lecturer profile if relevant fields present
    if (title !== undefined || specialization !== undefined || departmentId !== undefined) {
      await this.prisma.lecturerProfile.updateMany({
        where: { userId: id },
        data: {
          ...(title !== undefined && { title }),
          ...(specialization !== undefined && { specialization }),
          ...(departmentId && { departmentId }),
        },
      });
    }

    return this.findOne(id);
  }

  // ── updatePassword ─────────────────────────────────────────────────────────

  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with id "${id}" not found`);

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({ where: { id }, data: { password: hashedPassword } });

    return { message: 'Password updated successfully' };
  }

  // ── deactivate ─────────────────────────────────────────────────────────────

  async deactivate(id: string) {
    await this.findOne(id);
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    return { message: 'User deactivated successfully' };
  }

  // ── activate ───────────────────────────────────────────────────────────────

  async activate(id: string) {
    await this.findOne(id);
    await this.prisma.user.update({ where: { id }, data: { isActive: true } });
    return { message: 'User activated successfully' };
  }

  // ── findStudents ───────────────────────────────────────────────────────────

  async findStudents(query: StudentQuery) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const profileWhere: Record<string, unknown> = {};
    if (query.programmeId) profileWhere.programmeId = query.programmeId;
    if (query.yearOfStudy) profileWhere.yearOfStudy = Number(query.yearOfStudy);

    const userWhere: Record<string, unknown> = {
      role: UserRole.STUDENT,
      studentProfile: Object.keys(profileWhere).length > 0 ? { ...profileWhere } : undefined,
    };

    if (query.search) {
      userWhere.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { studentProfile: { studentNumber: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [students, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: userWhere,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          phone: true,
          createdAt: true,
          studentProfile: {
            include: { programme: { include: { department: true } } },
          },
        },
        orderBy: { firstName: 'asc' },
      }),
      this.prisma.user.count({ where: userWhere }),
    ]);

    return { data: students, meta: this.buildPaginationMeta(total, page, limit) };
  }

  // ── findLecturers ──────────────────────────────────────────────────────────

  async findLecturers(query: LecturerQuery) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const userWhere: Record<string, unknown> = {
      role: { in: [UserRole.LECTURER, UserRole.HEAD_OF_DEPARTMENT] },
    };

    if (query.departmentId) {
      userWhere.lecturerProfile = { departmentId: query.departmentId };
    }

    if (query.search) {
      userWhere.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { lecturerProfile: { staffNumber: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [lecturers, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: userWhere,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          phone: true,
          createdAt: true,
          lecturerProfile: {
            include: { department: { include: { faculty: true } } },
          },
        },
        orderBy: { firstName: 'asc' },
      }),
      this.prisma.user.count({ where: userWhere }),
    ]);

    return { data: lecturers, meta: this.buildPaginationMeta(total, page, limit) };
  }
}
