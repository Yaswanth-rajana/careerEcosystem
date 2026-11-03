'use strict';
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  UserCheck 
} from 'lucide-react';

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
    member: any;
    isNewUser: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!token) {
      setError('Missing invitation token. Please check your invitation link.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/recruiter/team/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to accept invitation.');
      }

      setSuccessData({
        member: data.member || { role: data.role },
        isNewUser: data.isNewUser,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while accepting the invitation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-2xl font-black text-white tracking-tight">PATHWAY<span className="text-blue-500">.ECO</span></span>
          </div>
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Recruiter Workspace Invitation</p>
        </div>

        {!token && (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Invalid Invitation Link</h3>
            <p className="text-sm text-slate-400 mb-6">No invitation token was found in this URL. Please verify the link from your email.</p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition"
            >
              Go to Login
            </Link>
          </div>
        )}

        {token && !successData && !error && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-5 border border-blue-500/20 shadow-inner">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Join Recruitment Team</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              You have been invited to join a workspace team on PATHWAY.ECO. Click below to accept and activate your workspace role.
            </p>

            <button
              onClick={handleAccept}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Activating Membership...
                </>
              ) : (
                <>
                  Accept & Join Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Unable to Accept Invitation</h3>
            <p className="text-sm text-rose-300/80 mb-6 bg-rose-950/40 p-3 rounded-lg border border-rose-900/50">
              {error}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleAccept}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition"
              >
                Retry
              </button>
              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl text-slate-400 hover:text-white font-medium text-sm transition"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        )}

        {successData && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-5 border border-emerald-500/20 shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Welcome to the Team!</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Your membership has been activated successfully with role{' '}
              <span className="font-semibold text-emerald-400">
                {successData.member?.role?.replace(/_/g, ' ') || 'Team Member'}
              </span>.
            </p>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400 font-medium">Role Assigned</div>
                  <div className="text-sm font-semibold text-white">{successData.member?.role}</div>
                </div>
              </div>
              {successData.isNewUser && (
                <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-amber-300 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>An account was created for you. You can sign in using your work email.</span>
                </div>
              )}
            </div>

            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition"
            >
              Enter Recruiter Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} PATHWAY.ECO. All rights reserved.
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}
