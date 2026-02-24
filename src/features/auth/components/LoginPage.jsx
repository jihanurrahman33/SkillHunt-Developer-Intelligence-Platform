'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: result.error,
          background: '#0B1220',
          color: '#e2e8f0',
          confirmButtonColor: '#2563EB',
        });
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong. Please try again.',
        background: '#0B1220',
        color: '#e2e8f0',
        confirmButtonColor: '#2563EB',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch (error) {
      setSocialLoading('');
    }
  };

  const handleDemoAdminLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: 'nishak.admin@skillhunt.com',
        password: '123456',
        redirect: false,
      });

      if (result?.error) {
        Swal.fire({
          icon: 'error',
          title: 'Demo Login Failed',
          text: result.error,
          background: '#0B1220',
          color: '#e2e8f0',
          confirmButtonColor: '#2563EB',
        });
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong. Please try again.',
        background: '#0B1220',
        color: '#e2e8f0',
        confirmButtonColor: '#2563EB',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="SkillHunt Logo" className="mx-auto mb-4 h-14 object-contain" />
          <h1 className="text-xl font-semibold text-foreground">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to SkillHunt IntelliTrack
          </p>
        </div>

        {/* Demo Admin Login Button */}
        <div className="mb-4">
          <button
            onClick={handleDemoAdminLogin}
            disabled={isLoading || !!socialLoading}
            type="button"
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-primary bg-primary/10 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <HiOutlineLockClosed className="h-4 w-4" />
            )}
            Demo Admin Login
          </button>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => handleSocialLogin('github')}
            disabled={!!socialLoading}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface text-sm font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-50"
          >
            {socialLoading === 'github' ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            ) : (
              <FaGithub className="h-4 w-4" />
            )}
            Continue with GitHub
          </button>

          <button
            onClick={() => handleSocialLogin('google')}
            disabled={!!socialLoading}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface text-sm font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-50"
          >
            {socialLoading === 'google' ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            ) : (
              <FaGoogle className="h-4 w-4" />
            )}
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Credential Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <HiOutlineMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="you@company.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address',
                  },
                })}
                className={`w-full rounded-md border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary ${
                  errors.email ? 'border-danger focus:ring-danger' : 'border-border focus:border-primary'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-danger">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className={`w-full rounded-md border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary ${
                  errors.password ? 'border-danger focus:ring-danger' : 'border-border focus:border-primary'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-danger">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-9 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-primary hover:text-primary-hover"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <LoginContent />
    </React.Suspense>
  );
}
