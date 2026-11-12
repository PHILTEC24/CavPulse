import { PrismaClient, UserRole, DayOfWeek, LectureSessionStatus, AttendanceStatus, AttendanceMethod } from '@prisma/client';
import * as bcrypt from '../apps/api/node_modules/bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CavPulse database seeding...');

  // 1. Attendance Policy
  const policy = await prisma.attendancePolicy.upsert({
    where: { id: 'default-policy' },
    update: {},
    create: {
      id: 'default-policy',
      minimumAttendancePercent: 75.0,
      lateThresholdMinutes: 15,
      attendanceWindowMinutes: 30,
      isDefault: true,
    },
  });
  console.log('✓ Default attendance policy created');

  // 2. Academic Year & Semester
  const academicYear = await prisma.academicYear.upsert({
    where: { name: '2024/2025' },
    update: {},
    create: {
      name: '2024/2025',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2025-07-31'),
      isCurrent: true,
    },
  });

  const semester = await prisma.semester.upsert({
    where: {
      academicYearId_semesterNumber: {
        academicYearId: academicYear.id,
        semesterNumber: 1,
      },
    },
    update: {},
    create: {
      name: 'Semester 1 - 2024/2025',
      academicYearId: academicYear.id,
      semesterNumber: 1,
      startDate: new Date('2024-08-15'),
      endDate: new Date('2024-12-20'),
      isCurrent: true,
    },
  });
  console.log('✓ Academic year and semester created');

  // 3. Faculty
  const faculty = await prisma.faculty.upsert({
    where: { code: 'FST' },
    update: {},
    create: {
      name: 'Faculty of Science & Technology',
      code: 'FST',
      description: 'Department of Computing, Information Technology and Engineering',
      isActive: true,
    },
  });

  // 4. Department
  const department = await prisma.department.upsert({
    where: { code: 'CIT' },
    update: {},
    create: {
      name: 'Department of Computing & Information Technology',
      code: 'CIT',
      facultyId: faculty.id,
      isActive: true,
    },
  });

  // 5. Programme
  const programme = await prisma.programme.upsert({
    where: { code: 'BSSE' },
    update: {},
    create: {
      name: 'Bachelor of Science in Software Engineering',
      code: 'BSSE',
      departmentId: department.id,
      durationYears: 3,
      description: 'Undergraduate software engineering degree',
      isActive: true,
    },
  });
  console.log('✓ Faculty, Department, and Programme created');

  // 6. Demo Users (matching login-form.tsx credentials)
  const passwordAdmin = await bcrypt.hash('Admin@123', 12);
  const passwordAcademic = await bcrypt.hash('Academic@123', 12);
  const passwordHod = await bcrypt.hash('Hod@123', 12);
  const passwordLecturer = await bcrypt.hash('Lecturer@123', 12);
  const passwordStudent = await bcrypt.hash('Student@123', 12);

  // Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cavpulse.ac.ug' },
    update: { password: passwordAdmin },
    create: {
      email: 'admin@cavpulse.ac.ug',
      password: passwordAdmin,
      firstName: 'Dr. Joseph',
      lastName: 'Mukasa',
      role: UserRole.SUPER_ADMIN,
      phone: '+256701000001',
    },
  });

  // Academic Admin
  const academicAdmin = await prisma.user.upsert({
    where: { email: 'academic@cavpulse.ac.ug' },
    update: { password: passwordAcademic },
    create: {
      email: 'academic@cavpulse.ac.ug',
      password: passwordAcademic,
      firstName: 'Sarah',
      lastName: 'Namara',
      role: UserRole.ACADEMIC_ADMIN,
      phone: '+256701000002',
    },
  });

  // HoD
  const hodUser = await prisma.user.upsert({
    where: { email: 'hod.cs@cavpulse.ac.ug' },
    update: { password: passwordHod },
    create: {
      email: 'hod.cs@cavpulse.ac.ug',
      password: passwordHod,
      firstName: 'Dr. Grace',
      lastName: 'Auma',
      role: UserRole.HEAD_OF_DEPARTMENT,
      phone: '+256701000003',
    },
  });

  await prisma.lecturerProfile.upsert({
    where: { userId: hodUser.id },
    update: {},
    create: {
      userId: hodUser.id,
      staffNumber: 'CUU-STF-001',
      departmentId: department.id,
      title: 'Dr.',
      specialization: 'Distributed Systems & Network Security',
    },
  });

  await prisma.department.update({
    where: { id: department.id },
    data: { headOfDepartmentId: hodUser.id },
  });

  // Lecturer
  const lecturerUser = await prisma.user.upsert({
    where: { email: 'lecturer@cavpulse.ac.ug' },
    update: { password: passwordLecturer },
    create: {
      email: 'lecturer@cavpulse.ac.ug',
      password: passwordLecturer,
      firstName: 'Paul',
      lastName: 'Kigozi',
      role: UserRole.LECTURER,
      phone: '+256701000004',
    },
  });

  const lecturerProfile = await prisma.lecturerProfile.upsert({
    where: { userId: lecturerUser.id },
    update: {},
    create: {
      userId: lecturerUser.id,
      staffNumber: 'CUU-STF-042',
      departmentId: department.id,
      title: 'Mr.',
      specialization: 'Web Applications & Cloud Architectures',
    },
  });

  // Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@cavpulse.ac.ug' },
    update: { password: passwordStudent },
    create: {
      email: 'student@cavpulse.ac.ug',
      password: passwordStudent,
      firstName: 'Brian',
      lastName: 'Otim',
      role: UserRole.STUDENT,
      phone: '+256701000005',
    },
  });

  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      studentNumber: 'CUU-2023-0142',
      programmeId: programme.id,
      yearOfStudy: 2,
    },
  });

  console.log('✓ Demo users & profiles seeded:');
  console.log('   - Admin: admin@cavpulse.ac.ug / Admin@123');
  console.log('   - Academic: academic@cavpulse.ac.ug / Academic@123');
  console.log('   - HoD: hod.cs@cavpulse.ac.ug / Hod@123');
  console.log('   - Lecturer: lecturer@cavpulse.ac.ug / Lecturer@123');
  console.log('   - Student: student@cavpulse.ac.ug / Student@123');

  // 7. Course
  const course = await prisma.course.upsert({
    where: { code: 'BIT2101' },
    update: {},
    create: {
      code: 'BIT2101',
      name: 'Web Applications Development',
      credits: 4,
      yearLevel: 2,
      departmentId: department.id,
      description: 'Full-stack modern web architectures and real-time distributed applications',
      isActive: true,
    },
  });

  // 8. Course Assignment
  const assignment = await prisma.courseAssignment.upsert({
    where: {
      courseId_lecturerId_semesterId: {
        courseId: course.id,
        lecturerId: lecturerProfile.id,
        semesterId: semester.id,
      },
    },
    update: {},
    create: {
      courseId: course.id,
      lecturerId: lecturerProfile.id,
      semesterId: semester.id,
      isActive: true,
    },
  });

  // 9. Course Registration for Student
  await prisma.courseRegistration.upsert({
    where: {
      studentId_courseAssignmentId: {
        studentId: studentProfile.id,
        courseAssignmentId: assignment.id,
      },
    },
    update: {},
    create: {
      studentId: studentProfile.id,
      courseAssignmentId: assignment.id,
      isActive: true,
    },
  });

  // 10. Timetable Slot
  const slot = await prisma.timetableSlot.create({
    data: {
      courseAssignmentId: assignment.id,
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: '09:00',
      endTime: '11:00',
      room: 'Lab 3B',
      building: 'Sawa World Building',
      isActive: true,
    },
  });

  // 11. Initial Lecture Session for Demo
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const session = await prisma.lectureSession.upsert({
    where: {
      timetableSlotId_date: {
        timetableSlotId: slot.id,
        date: today,
      },
    },
    update: {},
    create: {
      timetableSlotId: slot.id,
      date: today,
      status: LectureSessionStatus.ACTIVE,
      lecturerCheckInAt: new Date(),
      attendanceWindowMinutes: 30,
      lateThresholdMinutes: 15,
      notes: 'Lecture 1: Introduction to Next.js 14 and WebSockets',
    },
  });

  // 12. Seed attendance record
  await prisma.attendanceRecord.upsert({
    where: {
      sessionId_studentId: {
        sessionId: session.id,
        studentId: studentProfile.id,
      },
    },
    update: {},
    create: {
      sessionId: session.id,
      studentId: studentProfile.id,
      status: AttendanceStatus.PRESENT,
      method: AttendanceMethod.QR_CODE,
      recordedAt: new Date(),
    },
  });

  console.log('✓ Timetable, course assignment, active session & attendance seeded');
  console.log('🚀 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

