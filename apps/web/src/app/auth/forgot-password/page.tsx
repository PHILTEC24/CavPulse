'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowLeft, CheckCircle2, Send, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import apiClient from '@/lib/api';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid university email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: data.email }).catch(() => {});
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success('Password reset instructions sent');
    } catch {
      toast.error('Could not process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Stamp */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              CavPulse
            </h2>
            <p className="text-xs text-muted-foreground font-semibold">
              Cavendish University Uganda
            </p>
          </div>
        </div>

        <Card className="border-border/80 shadow-xl bg-card">
          <CardContent className="p-6 sm:p-8 space-y-5">
            {isSubmitted ? (
              <div className="space-y-4 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Check your university email
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    We sent password reset instructions to{' '}
                    <strong className="text-slate-900 dark:text-slate-100">{submittedEmail}</strong>.
                    Follow the link in the email to set a new password.
                  </p>
                </div>

                <div className="pt-2">
                  <Button asChild variant="outline" className="w-full text-xs">
                    <Link href="/auth/login" className="flex items-center justify-center gap-1.5">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Forgot Password?
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Enter your university email and we will send you a secure link to reset your CavPulse password.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">University Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="s.mukasa@cavendish.ac.ug"
                        className="pl-9"
                        error={errors.email?.message}
                        {...register('email')}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="cavpulse"
                    className="w-full h-10 text-xs font-semibold gap-2 mt-2"
                    isLoading={isLoading}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Reset Link
                  </Button>

                  <div className="text-center pt-2">
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 gap-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

