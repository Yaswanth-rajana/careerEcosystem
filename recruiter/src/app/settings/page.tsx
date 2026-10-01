'use client';

import React, { useState } from 'react';
import {
  Settings,
  User,
  Lock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
} from 'lucide-react';
import { RecruiterShell } from '@/components/RecruiterShell';
import { useRecruiterAuth } from '@/lib/recruiterAuthContext';

export default function SettingsPage() {
  const { recruiterData, logout } = useRecruiterAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const user = recruiterData?.user;
  const company = recruiterData?.company;

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch('/api/recruiter/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to change password');
      }

      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <RecruiterShell
      title="Account Settings"
      subtitle="Manage your personal profile, credentials, and organization membership"
    >
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Personal Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-500">Name</label>
              <p className="mt-1 font-semibold text-slate-900">{user?.name || 'Recruiter'}</p>
            </div>
            <div>
              <label className="block font-medium text-slate-500">Email Address</label>
              <p className="mt-1 font-semibold text-slate-900">{user?.email}</p>
            </div>
            <div>
              <label className="block font-medium text-slate-500">Company</label>
              <p className="mt-1 font-semibold text-slate-900">{company?.name}</p>
            </div>
            <div>
              <label className="block font-medium text-slate-500">Workspace Role</label>
              <p className="mt-1 font-semibold text-slate-900">
                {recruiterData?.companyRole || 'RECRUITER'}
              </p>
            </div>
          </div>
        </div>

        {/* Password Update Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">Change Password</h3>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters..."
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updating}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 transition"
              >
                {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Session Management */}
        <div className="rounded-xl border border-red-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Sign Out</h3>
            <p className="text-xs text-slate-500 mt-0.5">End your active recruiter session on this device.</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </RecruiterShell>
  );
}
