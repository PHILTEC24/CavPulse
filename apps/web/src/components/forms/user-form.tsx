'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '@cavpulse/shared';
import toast from 'react-hot-toast';

const userSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid university email'),
  role: z.nativeEnum(UserRole),
  phone: z.string().optional(),
  studentOrStaffNumber: z.string().min(3, 'Registration or Staff Number is required'),
  department: z.string().min(2, 'Department or Faculty is required'),
});

export type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  initialValues?: Partial<UserFormData>;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({ initialValues, onSubmitSuccess, onCancel }: UserFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: initialValues?.firstName || '',
      lastName: initialValues?.lastName || '',
      email: initialValues?.email || '',
      role: initialValues?.role || UserRole.STUDENT,
      phone: initialValues?.phone || '',
      studentOrStaffNumber: initialValues?.studentOrStaffNumber || '',
      department: initialValues?.department || 'Faculty of Science & Technology',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: UserFormData) => {
    try {
      // In production calls apiClient.post('/users', data)
      await new Promise((res) => setTimeout(res, 800));
      toast.success(`User ${data.firstName} ${data.lastName} saved successfully!`);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch {
      toast.error('Failed to save user');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="e.g. Brian"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="e.g. Ochieng"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">University Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="b.ochieng@cavendish.ac.ug"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="role">User Role</Label>
          <select
            id="role"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
            {...register('role')}
          >
            <option value={UserRole.STUDENT}>Student</option>
            <option value={UserRole.LECTURER}>Lecturer</option>
            <option value={UserRole.HEAD_OF_DEPARTMENT}>Head of Department</option>
            <option value={UserRole.ACADEMIC_ADMIN}>Academic Admin</option>
            <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="studentOrStaffNumber">
            {selectedRole === UserRole.STUDENT ? 'Student Reg Number' : 'Staff Number'}
          </Label>
          <Input
            id="studentOrStaffNumber"
            placeholder={selectedRole === UserRole.STUDENT ? 'CUU/2024/0481' : 'CUU-STAFF-104'}
            error={errors.studentOrStaffNumber?.message}
            {...register('studentOrStaffNumber')}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="department">Department / Faculty</Label>
        <Input
          id="department"
          placeholder="e.g. Dept of Computing & IT"
          error={errors.department?.message}
          {...register('department')}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">Phone Contact (Optional)</Label>
        <Input
          id="phone"
          placeholder="+256 700 000 000"
          {...register('phone')}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="cavpulse"
          size="sm"
          isLoading={isSubmitting}
        >
          Save User Profile
        </Button>
      </div>
    </form>
  );
}

