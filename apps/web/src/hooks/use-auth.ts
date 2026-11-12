'use client';

import { useAuthStore } from '../stores/auth.store';
import { UserRole } from '@cavpulse/shared';
import { useRouter } from 'next/navigation';
import { getRoleDashboardPath } from '../lib/auth';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    setUser,
    clearError,
  } = useAuthStore();

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isAcademicAdmin = user?.role === UserRole.ACADEMIC_ADMIN;
  const isHoD = user?.role === UserRole.HEAD_OF_DEPARTMENT;
  const isLecturer = user?.role === UserRole.LECTURER;
  const isStudent = user?.role === UserRole.STUDENT;

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const redirectToDashboard = () => {
    if (user) {
      router.push(getRoleDashboardPath(user.role));
    } else {
      router.push('/auth/login');
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    setUser,
    clearError,
    isSuperAdmin,
    isAcademicAdmin,
    isHoD,
    isLecturer,
    isStudent,
    hasRole,
    redirectToDashboard,
  };
}

