'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthInput } from './AuthInput';
import { SocialAuthButton } from './SocialAuthButton';
import { AuthDivider } from './AuthDivider';
import { loginUser } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { LoginSchema } from '@backend/validations/schemas';

interface SignInFormProps {
  onSwitchMode: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSwitchMode }) => {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = LoginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    const res = await loginUser({ email, password });

    if (res.error) {
      setErrors({ general: res.error });
      setIsSubmitting(false);
    } else {
      await refreshUser();
      const target = res.user?.isOnboarded ? '/dashboard' : '/onboarding';
      router.push(target);
    }
  };

  const handleGoogleSuccess = async (res: any) => {
    await refreshUser();
    const target = res.redirectTo || (res.user?.isOnboarded ? '/dashboard' : '/onboarding');
    router.push(target);
  };

  const handleGoogleError = (errorMessage: string) => {
    setErrors({ general: errorMessage });
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {/* Header Section */}
      <div className="space-y-1.5 text-left">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6366F1]">
          PATHWAY.ECO
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[#0F172A]">
          Welcome back.
        </h2>
        <p className="text-sm text-slate-600">
          Continue your career journey.
        </p>
      </div>

      {/* General Error Alert */}
      {errors.general && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Form Elements */}
      <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
        <AuthInput
          id="signin-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={isSubmitting}
        />

        <div className="space-y-1.5">
          <AuthInput
            id="signin-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={isSubmitting}
          />
          <div className="flex justify-end pt-0.5">
            <Link
              href="/reset-password"
              className="text-xs font-medium text-slate-500 hover:text-[#6366F1] transition-colors focus:outline-none focus-visible:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-[52px] rounded-[14px] bg-blue-600 hover:bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <AuthDivider />

      {/* Google Button */}
      <SocialAuthButton
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        disabled={isSubmitting}
      />

      {/* Mode Toggle Link */}
      <div className="pt-2 text-center text-xs text-slate-600">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchMode}
          className="font-semibold text-[#6366F1] hover:text-[#8B5CF6] hover:underline transition-colors focus:outline-none focus-visible:underline"
        >
          Create your account →
        </button>
      </div>
    </div>
  );
};
