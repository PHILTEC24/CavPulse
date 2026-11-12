import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSessionReport(sessionId: string) {
    const session = await this.prisma.lectureSession.findUnique({
      where: { id: sessionId },
      include: {
        timetableSlot: {
          include: {
            courseAssignment: {
              include: {
                course: true,
                lecturer: { include: { user: true } },
                semester: true,
              },
            },
          },
        },
        attendanceRecords: {
          include: {
            student: {
              include: {
                user: true,
                programme: true,
              },
            },
          },
          orderBy: { student: { studentNumber: 'asc' } },
        },
      },
    });

    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);

    const ca = session.timetableSlot.courseAssignment;
    const records = session.attendanceRecords;
    const total = records.length;
    const present = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const late = records.filter((r) => r.status === AttendanceStatus.LATE).length;
    const absent = records.filter((r) => r.status === AttendanceStatus.ABSENT).length;
    const excused = records.filter((r) => r.status === AttendanceStatus.EXCUSED).length;

    return {
      session: {
        id: session.id,
        courseCode: ca.course.code,
        courseName: ca.course.name,
        lecturer: `${ca.lecturer.user.firstName} ${ca.lecturer.user.lastName}`,
        room: session.timetableSlot.room,
        startTime: session.timetableSlot.startTime,
        endTime: session.timetableSlot.endTime,
        status: session.status,
      },
      stats: {
        totalEnrolled: total,
        present,
        late,
        absent,
        excused,
        attendanceRate: total > 0 ? Math.round(((present + late + excused) / total) * 100 * 10) / 10 : 0,
      },
      records: records.map((r) => ({
        id: r.id,
        studentNumber: r.student.studentNumber,
        studentName: `${r.student.user.firstName} ${r.student.user.lastName}`,
        programme: r.student.programme.name,
        status: r.status,
        method: r.method,
        timestamp: r.recordedAt,
      })),
    };
  }

  async getCourseReport(courseAssignmentId: string) {
    const ca = await this.prisma.courseAssignment.findUnique({
      where: { id: courseAssignmentId },
      include: {
        course: true,
        lecturer: { include: { user: true } },
        semester: true,
        timetableSlots: {
          include: {
            sessions: {
              orderBy: { date: 'asc' },
              include: { attendanceRecords: true },
            },
          },
        },
        registrations: {
          where: { isActive: true },
          include: {
            student: {
              include: { user: true, programme: true },
            },
          },
        },
      },
    });

    if (!ca) throw new NotFoundException(`Course assignment ${courseAssignmentId} not found`);

    const allSessions = ca.timetableSlots.flatMap((slot) => slot.sessions);
    const totalSessions = allSessions.length;

    const studentReports = ca.registrations.map((reg) => {
      const studentId = reg.studentId;
      let attended = 0;
      let present = 0;
      let late = 0;
      let absent = 0;
      let excused = 0;

      for (const session of allSessions) {
        const record = session.attendanceRecords.find((r) => r.studentId === studentId);
        if (record) {
          if (record.status === AttendanceStatus.PRESENT) {
            present++;
            attended++;
          } else if (record.status === AttendanceStatus.LATE) {
            late++;
            attended++;
          } else if (record.status === AttendanceStatus.EXCUSED) {
            excused++;
            attended++;
          } else {
            absent++;
          }
        } else {
          absent++;
        }
      }

      const rate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100 * 10) / 10 : 0;

      return {
        studentId,
        studentNumber: reg.student.studentNumber,
        studentName: `${reg.student.user.firstName} ${reg.student.user.lastName}`,
        programme: reg.student.programme.name,
        totalSessions,
        present,
        late,
        absent,
        excused,
        attendanceRate: rate,
        isEligibleForExam: rate >= 75.0,
      };
    });

    return {
      course: {
        code: ca.course.code,
        name: ca.course.name,
        lecturer: `${ca.lecturer.user.firstName} ${ca.lecturer.user.lastName}`,
        semester: ca.semester.name,
        totalSessions,
      },
      students: studentReports.sort((a, b) => a.studentNumber.localeCompare(b.studentNumber)),
    };
  }

  async getStudentReport(studentId: string, semesterId?: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        programme: { include: { department: true } },
        registrations: {
          where: {
            isActive: true,
            ...(semesterId ? { courseAssignment: { semesterId } } : {}),
          },
          include: {
            courseAssignment: {
              include: {
                course: true,
                semester: true,
                timetableSlots: {
                  include: {
                    sessions: {
                      include: {
                        attendanceRecords: { where: { studentId } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) throw new NotFoundException(`Student ${studentId} not found`);

    const courses = student.registrations.map((reg) => {
      const ca = reg.courseAssignment;
      const allSessions = ca.timetableSlots.flatMap((slot) => slot.sessions);
      const totalSessions = allSessions.length;
      let attended = 0;
      let present = 0;
      let late = 0;
      let absent = 0;
      let excused = 0;

      for (const s of allSessions) {
        const rec = s.attendanceRecords[0];
        if (rec) {
          if (rec.status === AttendanceStatus.PRESENT) { present++; attended++; }
          else if (rec.status === AttendanceStatus.LATE) { late++; attended++; }
          else if (rec.status === AttendanceStatus.EXCUSED) { excused++; attended++; }
          else { absent++; }
        } else {
          absent++;
        }
      }

      const rate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100 * 10) / 10 : 0;
      return {
        courseCode: ca.course.code,
        courseName: ca.course.name,
        totalSessions,
        present,
        late,
        absent,
        excused,
        attendanceRate: rate,
        isEligibleForExam: rate >= 75.0,
      };
    });

    return {
      student: {
        studentNumber: student.studentNumber,
        name: `${student.user.firstName} ${student.user.lastName}`,
        programme: student.programme.name,
        yearOfStudy: student.yearOfStudy,
      },
      courses,
    };
  }
}
