// ============================================================
// CavPulse Shared Types Package
// All TypeScript types, enums, and DTOs shared between
// the frontend (apps/web) and backend (apps/api).
// ============================================================

// ─── Enums ───────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ACADEMIC_ADMIN = 'ACADEMIC_ADMIN',
  HEAD_OF_DEPARTMENT = 'HEAD_OF_DEPARTMENT',
  LECTURER = 'LECTURER',
  STUDENT = 'STUDENT',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
  PENDING = 'PENDING',
}

export enum AttendanceMethod {
  QR_CODE = 'QR_CODE',
  MANUAL = 'MANUAL',
  CORRECTION = 'CORRECTION',
}

export enum LectureSessionStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  MISSED = 'MISSED',
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum NotificationType {
  ATTENDANCE_RECORDED = 'ATTENDANCE_RECORDED',
  LOW_ATTENDANCE_ALERT = 'LOW_ATTENDANCE_ALERT',
  SESSION_STARTED = 'SESSION_STARTED',
  SESSION_CLOSED = 'SESSION_CLOSED',
  CORRECTION_REQUESTED = 'CORRECTION_REQUESTED',
  CORRECTION_APPROVED = 'CORRECTION_APPROVED',
  CORRECTION_REJECTED = 'CORRECTION_REJECTED',
  GENERAL = 'GENERAL',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

// ─── Core Entity Types ────────────────────────────────────────

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  avatarUrl?: string;
  studentProfile?: StudentProfile;
  lecturerProfile?: LecturerProfile;
}

export interface StudentProfile extends BaseEntity {
  userId: string;
  studentNumber: string;
  programmeId: string;
  programme?: Programme;
  yearOfStudy: number;
  gender?: Gender;
  dateOfBirth?: string;
  nationalId?: string;
}

export interface LecturerProfile extends BaseEntity {
  userId: string;
  staffNumber: string;
  departmentId: string;
  department?: Department;
  title?: string;
  specialization?: string;
}

export interface Faculty extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  departments?: Department[];
}

export interface Department extends BaseEntity {
  name: string;
  code: string;
  facultyId: string;
  faculty?: Faculty;
  headOfDepartmentId?: string;
  headOfDepartment?: User;
  programmes?: Programme[];
}

export interface Programme extends BaseEntity {
  name: string;
  code: string;
  departmentId: string;
  department?: Department;
  durationYears: number;
  description?: string;
}

export interface AcademicYear extends BaseEntity {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  semesters?: Semester[];
}

export interface Semester extends BaseEntity {
  name: string;
  academicYearId: string;
  academicYear?: AcademicYear;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  semesterNumber: number;
}

export interface Course extends BaseEntity {
  code: string;
  name: string;
  credits: number;
  departmentId: string;
  department?: Department;
  description?: string;
  yearLevel: number;
}

export interface CourseAssignment extends BaseEntity {
  courseId: string;
  course?: Course;
  lecturerId: string;
  lecturer?: User;
  semesterId: string;
  semester?: Semester;
  timetableSlots?: TimetableSlot[];
  _count?: { registrations: number };
}

export interface CourseRegistration extends BaseEntity {
  studentId: string;
  student?: User;
  courseAssignmentId: string;
  courseAssignment?: CourseAssignment;
  isActive: boolean;
}

export interface TimetableSlot extends BaseEntity {
  courseAssignmentId: string;
  courseAssignment?: CourseAssignment;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  room: string;
  building?: string;
  sessions?: LectureSession[];
}

export interface LectureSession extends BaseEntity {
  timetableSlotId: string;
  timetableSlot?: TimetableSlot;
  date: string; // ISO date
  status: LectureSessionStatus;
  lecturerCheckInAt?: string;
  lecturerCheckOutAt?: string;
  attendanceWindowMinutes: number;
  lateThresholdMinutes: number;
  notes?: string;
  attendanceRecords?: AttendanceRecord[];
  _count?: { attendanceRecords: number };
}

export interface AttendanceRecord extends BaseEntity {
  sessionId: string;
  session?: LectureSession;
  studentId: string;
  student?: User;
  status: AttendanceStatus;
  method: AttendanceMethod;
  recordedAt: string;
  verifiedAt?: string;
  verifiedById?: string;
  notes?: string;
}

export interface QRToken extends BaseEntity {
  sessionId: string;
  token: string;
  expiresAt: string;
  isInvalidated: boolean;
  refreshIntervalSeconds: number;
}

export interface AttendancePolicy extends BaseEntity {
  departmentId?: string;
  department?: Department;
  minimumAttendancePercent: number;
  lateThresholdMinutes: number;
  attendanceWindowMinutes: number;
  isDefault: boolean;
}

export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
}

export interface AuditLog extends BaseEntity {
  userId: string;
  user?: User;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

// ─── API Response Types ───────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Auth Types ───────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
  studentProfile?: StudentProfile;
  lecturerProfile?: LecturerProfile;
}

// ─── Analytics Types ──────────────────────────────────────────

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

export interface CourseAttendanceAnalytics {
  courseId: string;
  courseName: string;
  courseCode: string;
  totalSessions: number;
  summary: AttendanceSummary;
  trend: { date: string; rate: number }[];
}

export interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  studentNumber: string;
  courseId: string;
  courseName: string;
  summary: AttendanceSummary;
  isAtRisk: boolean;
}

export interface DepartmentAttendanceOverview {
  departmentId: string;
  departmentName: string;
  overallRate: number;
  totalStudents: number;
  atRiskStudents: number;
  courseBreakdown: CourseAttendanceAnalytics[];
}

// ─── WebSocket Event Types ────────────────────────────────────

export interface WsAttendanceUpdate {
  sessionId: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  status: AttendanceStatus;
  recordedAt: string;
  totalPresent: number;
  totalRegistered: number;
}

export interface WsSessionUpdate {
  sessionId: string;
  status: LectureSessionStatus;
  qrExpiresAt?: string;
}

export interface WsQrRefresh {
  sessionId: string;
  newQrUrl: string;
  expiresAt: string;
}

// ─── Utility Types ────────────────────────────────────────────

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

