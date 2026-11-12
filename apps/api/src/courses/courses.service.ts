import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(departmentId?: string) {
    return this.prisma.course.findMany({
      where: departmentId ? { departmentId } : undefined,
      include: {
        department: { include: { faculty: true } },
        assignments: {
          include: {
            lecturer: { include: { user: true } },
            semester: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        department: { include: { faculty: true } },
        assignments: {
          include: {
            lecturer: { include: { user: true } },
            semester: true,
            timetableSlots: true,
            _count: { select: { registrations: true, timetableSlots: true } },
          },
        },
      },
    });
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    return course;
  }

  async create(data: {
    code: string;
    name: string;
    departmentId: string;
    credits?: number;
    yearLevel?: number;
    description?: string;
  }) {
    return this.prisma.course.create({
      data: {
        code: data.code,
        name: data.name,
        departmentId: data.departmentId,
        credits: data.credits ?? 3,
        yearLevel: data.yearLevel ?? 1,
        description: data.description,
      },
      include: { department: true },
    });
  }

  async update(
    id: string,
    data: {
      code?: string;
      name?: string;
      departmentId?: string;
      credits?: number;
      yearLevel?: number;
      description?: string;
      isActive?: boolean;
    },
  ) {
    await this.findOne(id);
    return this.prisma.course.update({
      where: { id },
      data,
      include: { department: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.course.delete({ where: { id } });
  }

  // Course Assignments
  async assignLecturer(data: { courseId: string; lecturerId: string; semesterId: string }) {
    const existing = await this.prisma.courseAssignment.findUnique({
      where: {
        courseId_lecturerId_semesterId: {
          courseId: data.courseId,
          lecturerId: data.lecturerId,
          semesterId: data.semesterId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Lecturer is already assigned to this course for the selected semester');
    }

    return this.prisma.courseAssignment.create({
      data,
      include: {
        course: true,
        lecturer: { include: { user: true } },
        semester: true,
      },
    });
  }

  async registerStudent(data: { studentId: string; courseAssignmentId: string }) {
    const existing = await this.prisma.courseRegistration.findFirst({
      where: {
        studentId: data.studentId,
        courseAssignmentId: data.courseAssignmentId,
      },
    });

    if (existing) {
      throw new ConflictException('Student is already registered for this course assignment');
    }

    return this.prisma.courseRegistration.create({
      data,
      include: {
        courseAssignment: {
          include: { course: true },
        },
      },
    });
  }

  async getLecturerCourses(lecturerUserId: string) {
    const lecturer = await this.prisma.lecturerProfile.findUnique({
      where: { userId: lecturerUserId },
    });
    if (!lecturer) return [];

    return this.prisma.courseAssignment.findMany({
      where: { lecturerId: lecturer.id, isActive: true },
      include: {
        course: true,
        semester: true,
        timetableSlots: true,
        _count: { select: { registrations: true, timetableSlots: true } },
      },
    });
  }

  async getStudentCourses(studentUserId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) return [];

    const registrations = await this.prisma.courseRegistration.findMany({
      where: { studentId: student.id, isActive: true },
      include: {
        courseAssignment: {
          include: {
            course: true,
            lecturer: { include: { user: true } },
            semester: true,
            timetableSlots: true,
          },
        },
      },
    });

    return registrations.map((r) => r.courseAssignment);
  }
}

