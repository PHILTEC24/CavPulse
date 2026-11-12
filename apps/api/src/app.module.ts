import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FacultiesModule } from './faculties/faculties.module';
import { DepartmentsModule } from './departments/departments.module';
import { ProgrammesModule } from './programmes/programmes.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { CoursesModule } from './courses/courses.module';
import { TimetableModule } from './timetable/timetable.module';
import { SessionsModule } from './sessions/sessions.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { PoliciesModule } from './policies/policies.module';
import { RedisModule } from './redis/redis.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    // Core configuration
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),

    // Infrastructure
    PrismaModule,
    RedisModule,
    GatewayModule,

    // Auth & Users
    AuthModule,
    UsersModule,

    // Academic Structure
    FacultiesModule,
    DepartmentsModule,
    ProgrammesModule,
    AcademicYearsModule,
    CoursesModule,

    // Scheduling & Sessions
    TimetableModule,
    SessionsModule,

    // Core Feature
    AttendanceModule,

    // Analytics & Reports
    AnalyticsModule,
    ReportsModule,

    // Support
    NotificationsModule,
    AuditModule,
    PoliciesModule,
  ],
})
export class AppModule {}

