import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus, LectureSessionStatus } from '@prisma/client';

const AT_RISK_THRESHOLD = 75;

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Student Analytics ────────────────────────────────────────────────────

  async getStudentAnalytics(studentId: string, semesterId?: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        programme: { select: { name: true, code: true } },
        registrations: {
          where: {
            isActive: true,
            ...(semesterId ? { courseAssignment: { semesterId } } : {}),
          },
          include: {
            courseAssignment: {
              include: {
                course: { select: { code: true, name: true } },
                semester: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!student) throw new NotFoundException(`Student ${studentId} not found`);

    const courseStats = await Promise.all(
      student.registrations
        .filter((r) => r.courseAssignment.isActive)
        .map(async (reg) => {
          const ca = reg.courseAssignment;
          const records = await this.prisma.attendanceRecord.findMany({
            where: {
              studentId,
              session: { timetableSlot: { courseAssignmentId: ca.id } },
              status: { not: AttendanceStatus.PENDING },
            },
            select: { status: true },
          });

          const totalSessions = records.length;
          const present = records.filter(
            (r) => r.status === AttendanceStatus.PRESENT,
          ).length;
          const absent = records.filter(
            (r) => r.status === AttendanceStatus.ABSENT,
          ).length;
          const late = records.filter(
            (r) => r.status === AttendanceStatus.LATE,
          ).length;
          const excused = records.filter(
            (r) => r.status === AttendanceStatus.EXCUSED,
          ).length;

          // Attendance rate = (present + late + excused) / total
          const effectiveAttended = present + late + excused;
          const rate =
            totalSessions > 0
              ? Math.round((effectiveAttended / totalSessions) * 100)
              : 100;

          return {
            courseAssignmentId: ca.id,
            courseCode: ca.course.code,
            courseName: ca.course.name,
            semesterName: ca.semester.name,
            totalSessions,
            present,
            absent,
            late,
            excused,
            rate,
            isAtRisk: rate < AT_RISK_THRESHOLD && totalSessions > 0,
          };
        }),
    );

    const overallAttended = courseStats.reduce(
      (sum, c) => sum + c.present + c.late + c.excused,
      0,
    );
    const overallTotal = courseStats.reduce(
      (sum, c) => sum + c.totalSessions,
      0,
    );
    const overallRate =
      overallTotal > 0
        ? Math.round((overallAttended / overallTotal) * 100)
        : 100;

    return {
      student: {
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        email: student.user.email,
        studentNumber: student.studentNumber,
        programme: student.programme.name,
        programmeCode: student.programme.code,
        yearOfStudy: student.yearOfStudy,
      },
      overallRate,
      isAtRisk: overallRate < AT_RISK_THRESHOLD && overallTotal > 0,
      courses: courseStats,
    };
  }

  // ─── Course Analytics ────────────────────────────────────────────────────

  async getCourseAnalytics(courseAssignmentId: string) {
    const ca = await this.prisma.courseAssignment.findUnique({
      where: { id: courseAssignmentId },
      include: {
        course: true,
        semester: true,
        lecturer: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        registrations: {
          where: { isActive: true },
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true } },
                programme: { select: { code: true } },
              },
            },
          },
        },
      },
    });

    if (!ca) throw new NotFoundException(`Course assignment ${courseAssignmentId} not found`);

    const sessions = await this.prisma.lectureSession.findMany({
      where: {
        timetableSlot: { courseAssignmentId },
        status: { in: [LectureSessionStatus.CLOSED, LectureSessionStatus.ACTIVE] },
      },
      include: {
        attendanceRecords: {
          select: { studentId: true, status: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    const studentBreakdown = await Promise.all(
      ca.registrations.map(async (reg) => {
        const student = reg.student;
        const records = await this.prisma.attendanceRecord.findMany({
          where: {
            studentId: student.id,
            session: { timetableSlot: { courseAssignmentId } },
            status: { not: AttendanceStatus.PENDING },
          },
          select: { status: true },
        });

        const total = records.length;
        const present = records.filter(
          (r) => r.status === AttendanceStatus.PRESENT,
        ).length;
        const late = records.filter(
          (r) => r.status === AttendanceStatus.LATE,
        ).length;
        const excused = records.filter(
          (r) => r.status === AttendanceStatus.EXCUSED,
        ).length;
        const absent = records.filter(
          (r) => r.status === AttendanceStatus.ABSENT,
        ).length;

        const rate =
          total > 0 ? Math.round(((present + late + excused) / total) * 100) : 100;

        return {
          studentId: student.id,
          name: `${student.user.firstName} ${student.user.lastName}`,
          studentNumber: student.studentNumber,
          programmeCode: student.programme.code,
          yearOfStudy: student.yearOfStudy,
          total,
          present,
          late,
          excused,
          absent,
          rate,
          isAtRisk: rate < AT_RISK_THRESHOLD && total > 0,
        };
      }),
    );

    const sessionBreakdown = sessions.map((sess) => {
      const records = sess.attendanceRecords;
      const total = ca.registrations.length;
      const present = records.filter(
        (r) => r.status === AttendanceStatus.PRESENT,
      ).length;
      const late = records.filter(
        (r) => r.status === AttendanceStatus.LATE,
      ).length;
      const excused = records.filter(
        (r) => r.status === AttendanceStatus.EXCUSED,
      ).length;
      const absent = records.filter(
        (r) => r.status === AttendanceStatus.ABSENT,
      ).length;
      const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      return {
        sessionId: sess.id,
        date: sess.date,
        status: sess.status,
        totalRegistered: total,
        present,
        late,
        excused,
        absent,
        rate,
      };
    });

    const totalLectures = sessions.length;
    const avgRate =
      studentBreakdown.length > 0
        ? Math.round(
            studentBreakdown.reduce((sum, s) => sum + s.rate, 0) /
              studentBreakdown.length,
          )
        : 100;
    const atRiskCount = studentBreakdown.filter((s) => s.isAtRisk).length;

    return {
      course: {
        id: ca.course.id,
        code: ca.course.code,
        name: ca.course.name,
        credits: ca.course.credits,
      },
      semester: ca.semester.name,
      lecturer: `${ca.lecturer.user.firstName} ${ca.lecturer.user.lastName}`,
      totalEnrolled: ca.registrations.length,
      totalLectures,
      averageAttendanceRate: avgRate,
      atRiskCount,
      studentBreakdown,
      sessionBreakdown,
    };
  }

  // ─── Department Analytics ────────────────────────────────────────────────

  async getDepartmentAnalytics(departmentId: string, semesterId?: string) {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        faculty: true,
        headOfDepartment: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!department) throw new NotFoundException(`Department ${departmentId} not found`);

    const courseAssignments = await this.prisma.courseAssignment.findMany({
      where: {
        course: { departmentId },
        isActive: true,
        ...(semesterId ? { semesterId } : {}),
      },
      include: {
        course: true,
        lecturer: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        _count: { select: { registrations: true } },
      },
    });

    const courseAnalytics = await Promise.all(
      courseAssignments.map(async (ca) => {
        const records = await this.prisma.attendanceRecord.findMany({
          where: {
            session: { timetableSlot: { courseAssignmentId: ca.id } },
            status: { not: AttendanceStatus.PENDING },
          },
          select: { status: true },
        });

        const total = records.length;
        const attended = records.filter(
          (r) =>
            r.status === AttendanceStatus.PRESENT ||
            r.status === AttendanceStatus.LATE ||
            r.status === AttendanceStatus.EXCUSED,
        ).length;
        const rate = total > 0 ? Math.round((attended / total) * 100) : 100;

        return {
          courseAssignmentId: ca.id,
          code: ca.course.code,
          name: ca.course.name,
          lecturer: `${ca.lecturer.user.firstName} ${ca.lecturer.user.lastName}`,
          enrolledCount: ca._count.registrations,
          attendanceRate: rate,
          isLowAttendance: rate < AT_RISK_THRESHOLD,
        };
      }),
    );

    const overallRate =
      courseAnalytics.length > 0
        ? Math.round(
            courseAnalytics.reduce((sum, c) => sum + c.attendanceRate, 0) /
              courseAnalytics.length,
          )
        : 100;

    return {
      department: {
        id: department.id,
        name: department.name,
        code: department.code,
        faculty: department.faculty.name,
        headOfDepartment: department.headOfDepartment
          ? `${department.headOfDepartment.firstName} ${department.headOfDepartment.lastName}`
          : 'Not Assigned',
      },
      totalCourses: courseAssignments.length,
      averageAttendanceRate: overallRate,
      lowAttendanceCoursesCount: courseAnalytics.filter((c) => c.isLowAttendance).length,
      courses: courseAnalytics,
    };
  }

  // ─── Institution Analytics ───────────────────────────────────────────────

  async getInstitutionAnalytics(semesterId?: string) {
    const [totalStudents, totalLecturers, totalCourses, totalDepartments] =
      await Promise.all([
        this.prisma.studentProfile.count(),
        this.prisma.lecturerProfile.count(),
        this.prisma.course.count({ where: { isActive: true } }),
        this.prisma.department.count({ where: { isActive: true } }),
      ]);

    const activeSessionsCount = await this.prisma.lectureSession.count({
      where: { status: LectureSessionStatus.ACTIVE },
    });

    const allRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        status: { not: AttendanceStatus.PENDING },
        ...(semesterId
          ? { session: { timetableSlot: { courseAssignment: { semesterId } } } }
          : {}),
      },
      select: { status: true },
    });

    const totalRecords = allRecords.length;
    const attended = allRecords.filter(
      (r) =>
        r.status === AttendanceStatus.PRESENT ||
        r.status === AttendanceStatus.LATE ||
        r.status === AttendanceStatus.EXCUSED,
    ).length;
    const overallRate =
      totalRecords > 0 ? Math.round((attended / totalRecords) * 100) : 100;

    const departments = await this.prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
    });

    const departmentPerformance = await Promise.all(
      departments.map(async (dept) => {
        const records = await this.prisma.attendanceRecord.findMany({
          where: {
            session: {
              timetableSlot: {
                courseAssignment: { course: { departmentId: dept.id } },
              },
            },
            status: { not: AttendanceStatus.PENDING },
          },
          select: { status: true },
        });

        const deptTotal = records.length;
        const deptAttended = records.filter(
          (r) =>
            r.status === AttendanceStatus.PRESENT ||
            r.status === AttendanceStatus.LATE ||
            r.status === AttendanceStatus.EXCUSED,
        ).length;
        const rate =
          deptTotal > 0 ? Math.round((deptAttended / deptTotal) * 100) : 100;

        return {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          rate,
        };
      }),
    );

    return {
      kpis: {
        totalStudents,
        totalLecturers,
        totalCourses,
        totalDepartments,
        activeSessions: activeSessionsCount,
        overallAttendanceRate: overallRate,
      },
      departmentPerformance,
    };
  }

  // ─── Lecturer Analytics ──────────────────────────────────────────────────

  async getLecturerAnalytics(lecturerId: string, semesterId?: string) {
    const lecturer = await this.prisma.lecturerProfile.findUnique({
      where: { id: lecturerId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        department: { select: { name: true } },
        courseAssignments: {
          where: {
            isActive: true,
            ...(semesterId ? { semesterId } : {}),
          },
          include: {
            course: true,
            semester: true,
            _count: { select: { registrations: true } },
          },
        },
      },
    });

    if (!lecturer) throw new NotFoundException(`Lecturer ${lecturerId} not found`);

    const courseStats = await Promise.all(
      lecturer.courseAssignments.map(async (ca) => {
        const sessions = await this.prisma.lectureSession.findMany({
          where: { timetableSlot: { courseAssignmentId: ca.id } },
          include: {
            attendanceRecords: { select: { status: true } },
          },
        });

        const completedSessions = sessions.filter(
          (s) => s.status === LectureSessionStatus.CLOSED,
        ).length;
        const scheduledSessions = sessions.length;

        const allRecords = sessions.flatMap((s) => s.attendanceRecords);
        const attended = allRecords.filter(
          (r) =>
            r.status === AttendanceStatus.PRESENT ||
            r.status === AttendanceStatus.LATE ||
            r.status === AttendanceStatus.EXCUSED,
        ).length;
        const rate =
          allRecords.length > 0
            ? Math.round((attended / allRecords.length) * 100)
            : 100;

        return {
          courseAssignmentId: ca.id,
          code: ca.course.code,
          name: ca.course.name,
          semester: ca.semester.name,
          enrolledCount: ca._count.registrations,
          scheduledSessions,
          completedSessions,
          studentAttendanceRate: rate,
        };
      }),
    );

    return {
      lecturer: {
        id: lecturer.id,
        name: `${lecturer.user.firstName} ${lecturer.user.lastName}`,
        email: lecturer.user.email,
        staffNumber: lecturer.staffNumber,
        department: lecturer.department.name,
      },
      courses: courseStats,
    };
  }

  // ─── Attendance Trend ────────────────────────────────────────────────────

  async getAttendanceTrend(courseAssignmentId: string, limit = 10) {
    const sessions = await this.prisma.lectureSession.findMany({
      where: {
        timetableSlot: { courseAssignmentId },
        status: LectureSessionStatus.CLOSED,
      },
      include: {
        attendanceRecords: { select: { status: true } },
        timetableSlot: {
          include: {
            courseAssignment: {
              include: { _count: { select: { registrations: true } } },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return sessions.reverse().map((sess) => {
      const totalEnrolled =
        sess.timetableSlot.courseAssignment._count.registrations;
      const present = sess.attendanceRecords.filter(
        (r) => r.status === AttendanceStatus.PRESENT,
      ).length;
      const late = sess.attendanceRecords.filter(
        (r) => r.status === AttendanceStatus.LATE,
      ).length;
      const absent = sess.attendanceRecords.filter(
        (r) => r.status === AttendanceStatus.ABSENT,
      ).length;

      const rate =
        totalEnrolled > 0
          ? Math.round(((present + late) / totalEnrolled) * 100)
          : 0;

      return {
        date: sess.date,
        present,
        late,
        absent,
        rate,
      };
    });
  }
}
