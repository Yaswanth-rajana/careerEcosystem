'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useRecruiterAuth } from '@/lib/recruiterAuthContext';

function RecruiterSetupPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { refreshAuth } = useRecruiterAuth();

  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [applicantInfo, setApplicantInfo] = useState<{ name: string; email: string } | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setIsValidating(false);
        setTokenValid(false);
        setErrorMessage('No password setup token provided.');
        return;
      }

      try {
        const res = await fetch(`/api/recruiter/auth/verify-token?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setTokenValid(true);
          setApplicantInfo(data.user);
        } else {
          setTokenValid(false);
          setErrorMessage(data.error || 'This setup link is invalid or has expired.');
        }
      } catch {
        setTokenValid(false);
        setErrorMessage('Failed to verify setup link. Please contact support.');
      } finally {
        setIsValidating(false);
      }
    }

    verify();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await fetch('/api/recruiter/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to establish password.');
      }

      await refreshAuth();
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
            PATHWAY<span className="text-blue-600 font-normal">.ECO</span>
          </span>
        </div>

        <h2 className="text-xl font-display font-bold text-slate-900">
          Activate Your Employer Workspace
        </h2>
        <p className="text-xs text-slate-500">
          Set a secure password to finalize your account activation.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
          {isValidating ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-mono">Verifying activation token...</span>
            </div>
          ) : !tokenValid ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Invalid or Expired Link</h3>
              <p className="text-xs text-slate-600">
                {errorMessage || 'This activation link is no longer valid. Links expire after 24 hours.'}
              </p>
              <a
                href="/login"
                className="inline-block px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Go to Sign In
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {applicantInfo && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-0.5">
                  <p><strong className="text-slate-800">Account:</strong> {applicantInfo.name}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{applicantInfo.email}</p>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password (min 8 characters)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Activate Account & Enter Workspace <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RecruiterSetupPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs text-slate-400">Loading...</div>}>
      <RecruiterSetupPasswordContent />
    </Suspense>
  );
}
