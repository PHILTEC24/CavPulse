'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  BookOpen,
  Calendar,
  Radio,
  FileText,
  BarChart3,
  ShieldCheck,
  Settings,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@cavpulse/shared';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  // Super Admin Navigation
  {
    title: 'Dashboard',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Users',
    href: '/dashboard/admin#users',
    icon: Users,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Faculties',
    href: '/dashboard/admin#faculties',
    icon: Building2,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Departments',
    href: '/dashboard/admin#departments',
    icon: GraduationCap,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Courses',
    href: '/dashboard/admin#courses',
    icon: BookOpen,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Timetable',
    href: '/dashboard/admin#timetable',
    icon: Calendar,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Sessions',
    href: '/dashboard/lecturer/sessions',
    icon: Radio,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Reports',
    href: '/dashboard/admin#reports',
    icon: FileText,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Analytics',
    href: '/dashboard/admin#analytics',
    icon: BarChart3,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Audit Logs',
    href: '/dashboard/admin#audit',
    icon: ShieldCheck,
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Settings',
    href: '/dashboard/admin#settings',
    icon: Settings,
    roles: [UserRole.SUPER_ADMIN],
  },

  // Academic Admin Navigation
  {
    title: 'Dashboard',
    href: '/dashboard/academic',
    icon: LayoutDashboard,
    roles: [UserRole.ACADEMIC_ADMIN],
  },
  {
    title: 'Attendance',
    href: '/dashboard/academic#attendance',
    icon: CheckCircle2,
    roles: [UserRole.ACADEMIC_ADMIN],
  },
  {
    title: 'Reports',
    href: '/dashboard/academic#reports',
    icon: FileText,
    roles: [UserRole.ACADEMIC_ADMIN],
  },
  {
    title: 'Analytics',
    href: '/dashboard/academic#analytics',
    icon: BarChart3,
    roles: [UserRole.ACADEMIC_ADMIN],
  },
  {
    title: 'Disputes',
    href: '/dashboard/academic#disputes',
    icon: AlertCircle,
    roles: [UserRole.ACADEMIC_ADMIN],
  },

  // Head of Department (HoD) Navigation
  {
    title: 'Dashboard',
    href: '/dashboard/hod',
    icon: LayoutDashboard,
    roles: [UserRole.HEAD_OF_DEPARTMENT],
  },
  {
    title: 'Department',
    href: '/dashboard/hod#department',
    icon: Building2,
    roles: [UserRole.HEAD_OF_DEPARTMENT],
  },
  {
    title: 'Courses',
    href: '/dashboard/hod#courses',
    icon: BookOpen,
    roles: [UserRole.HEAD_OF_DEPARTMENT],
  },
  {
    title: 'Analytics',
    href: '/dashboard/hod#analytics',
    icon: BarChart3,
    roles: [UserRole.HEAD_OF_DEPARTMENT],
  },
  {
    title: 'Reports',
    href: '/dashboard/hod#reports',
    icon: FileText,
    roles: [UserRole.HEAD_OF_DEPARTMENT],
  },

  // Lecturer Navigation
  {
    title: 'Dashboard',
    href: '/dashboard/lecturer',
    icon: LayoutDashboard,
    roles: [UserRole.LECTURER],
  },
  {
    title: 'My Courses',
    href: '/dashboard/lecturer#courses',
    icon: BookOpen,
    roles: [UserRole.LECTURER],
  },
  {
    title: 'Sessions',
    href: '/dashboard/lecturer/sessions',
    icon: Radio,
    roles: [UserRole.LECTURER],
    badge: 'Live',
  },
  {
    title: 'Attendance',
    href: '/dashboard/lecturer#attendance',
    icon: CheckCircle2,
    roles: [UserRole.LECTURER],
  },
  {
    title: 'Reports',
    href: '/dashboard/lecturer#reports',
    icon: FileText,
    roles: [UserRole.LECTURER],
  },

  // Student Navigation
  {
    title: 'Dashboard',
    href: '/dashboard/student',
    icon: LayoutDashboard,
    roles: [UserRole.STUDENT],
  },
  {
    title: 'My Courses',
    href: '/dashboard/student#courses',
    icon: BookOpen,
    roles: [UserRole.STUDENT],
  },
  {
    title: 'Scan QR',
    href: '/dashboard/student/scan',
    icon: QrCode,
    roles: [UserRole.STUDENT],
    badge: 'Scan',
  },
  {
    title: 'My Attendance',
    href: '/dashboard/student#history',
    icon: CheckCircle2,
    roles: [UserRole.STUDENT],
  },
  {
    title: 'Reports',
    href: '/dashboard/student#reports',
    icon: FileText,
    roles: [UserRole.STUDENT],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role || UserRole.STUDENT;
  const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r bg-card h-screen sticky top-0 transition-all duration-300 z-30 select-none shadow-xs',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-300">
                CavPulse
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Cavendish Univ.
              </span>
            </div>
          </Link>
        )}

        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
          </Link>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.title + item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform group-hover:scale-105',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-muted-foreground'
                )}
              />
              {!collapsed && <span className="truncate">{item.title}</span>}
              {!collapsed && item.badge && (
                <span
                  className={cn(
                    'ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full',
                    item.badge === 'Live'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 animate-pulse'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Footer User section */}
      <div className="p-3 border-t bg-slate-50/50 dark:bg-slate-900/30">
        <Button
          variant="ghost"
          onClick={() => logout()}
          className={cn(
            'w-full flex items-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors',
            collapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3'
          )}
          title="Sign out"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}

