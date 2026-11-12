'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  QrCode,
  CheckCircle2,
  Radio,
  BookOpen,
  Users,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@cavpulse/shared';

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role || UserRole.STUDENT;

  // Student bottom items
  if (role === UserRole.STUDENT) {
    const studentLinks = [
      { label: 'Home', href: '/dashboard/student', icon: LayoutDashboard },
      { label: 'Scan QR', href: '/dashboard/student/scan', icon: QrCode, isPrimary: true },
      { label: 'Courses', href: '/dashboard/student#courses', icon: BookOpen },
      { label: 'History', href: '/dashboard/student#history', icon: CheckCircle2 },
    ];

    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t h-16 flex items-center justify-around px-2 pb-safe">
        {studentLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -top-4 relative"
              >
                <div className="h-12 w-12 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 text-xs transition-colors',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  // Lecturer bottom items
  if (role === UserRole.LECTURER) {
    const lecturerLinks = [
      { label: 'Home', href: '/dashboard/lecturer', icon: LayoutDashboard },
      { label: 'Sessions', href: '/dashboard/lecturer/sessions', icon: Radio },
      { label: 'Courses', href: '/dashboard/lecturer#courses', icon: BookOpen },
      { label: 'Reports', href: '/dashboard/lecturer#reports', icon: CheckCircle2 },
    ];

    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t h-16 flex items-center justify-around px-2 pb-safe">
        {lecturerLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 text-xs transition-colors',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  // Admin & HoD navigation
  const adminLinks = [
    {
      label: 'Home',
      href:
        role === UserRole.SUPER_ADMIN
          ? '/dashboard/admin'
          : role === UserRole.HEAD_OF_DEPARTMENT
          ? '/dashboard/hod'
          : '/dashboard/academic',
      icon: LayoutDashboard,
    },
    { label: 'Sessions', href: '/dashboard/lecturer/sessions', icon: Radio },
    { label: 'Users', href: '/dashboard/admin#users', icon: Users },
    { label: 'Settings', href: '/dashboard/admin#settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t h-16 flex items-center justify-around px-2 pb-safe">
      {adminLinks.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3 text-xs transition-colors',
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

