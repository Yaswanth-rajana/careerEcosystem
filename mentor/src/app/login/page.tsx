'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMentorAuth } from '@/lib/mentorAuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function MentorLoginPage() {
  const router = useRouter();
  const { refreshAuth } = useMentorAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/mentor/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      await refreshAuth();
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const setTestAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-md shadow-blue-500/30 mb-4">
          P
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
          PATHWAY<span className="text-blue-600">.ECO</span>
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Mentor Workspace & Operations Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200/80 rounded-2xl">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mentor Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. arjun.mehta@techlead.io"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Verifying access...' : 'Access Mentor Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo quick-fill accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Registered Mentors for Testing:</span>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setTestAccount('arjun.mehta@techlead.io')}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 rounded-lg text-xs transition"
              >
                <div className="font-semibold text-slate-800">Arjun Mehta (Staff Architect)</div>
                <div className="text-slate-500 text-[11px]">arjun.mehta@techlead.io • APPROVED</div>
              </button>
              <button
                type="button"
                onClick={() => setTestAccount('priya.sharma@aimlconsult.com')}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 rounded-lg text-xs transition"
              >
                <div className="font-semibold text-slate-800">Priya Sharma (Lead AI Engineer)</div>
                <div className="text-slate-500 text-[11px]">priya.sharma@aimlconsult.com • APPROVED</div>
              </button>
            </div>
          </div>

          <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-slate-600 leading-normal">
              Candidate accounts cannot access this portal. All mentorship operations enforce server-side role and ownership verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
