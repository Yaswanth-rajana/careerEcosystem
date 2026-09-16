'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthInput } from '@/components/auth/AuthInput';
import { resetPasswordRequest } from '@/lib/auth';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ForgotPasswordSchema } from '@backend/validations/schemas';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const validation = ForgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    const res = await resetPasswordRequest(email);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMessage(res.message || `Password reset instructions have been sent to ${email}.`);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0B0F19] text-[#F9FAFB] font-sans antialiased">
      <AuthHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
        <div className="w-full max-w-[540px] p-8 sm:p-12 rounded-[28px] border border-[#94A3B8]/12 bg-[#111827] shadow-[0_0_80px_rgba(99,102,241,0.12)] space-y-6">
          
          {/* Header */}
          <div className="space-y-2 text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6366F1]">
              PATHWAY.ECO
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-[#F9FAFB]">
              Reset your password.
            </h1>
            <p className="text-sm text-[#94A3B8]">
              Enter your email and we&apos;ll help you get back into your account.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 text-left" noValidate>
            <AuthInput
              id="reset-email"
              label="Email address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              disabled={isSubmitting}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[52px] rounded-[14px] bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] disabled:opacity-60 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F9FAFB] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>

        </div>
      </main>

      <footer className="w-full py-6 text-center text-xs text-[#94A3B8]/60 border-t border-[#94A3B8]/10">
        © {new Date().getFullYear()} PATHWAY.ECO. All rights reserved.
      </footer>
    </div>
  );
}
