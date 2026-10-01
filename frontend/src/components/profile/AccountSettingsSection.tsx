'use client';

import React, { useState } from 'react';
import { ShieldCheck, Mail, KeyRound, CheckCircle2, Lock, Check } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { Badge } from '@/components/design-system/Badge';
import { AccountSettingsDTO } from '@backend/types/profile';
import { updatePassword } from '@/lib/profileApi';

interface AccountSettingsSectionProps {
  account: AccountSettingsDTO;
  onPasswordChanged?: () => void;
}

export const AccountSettingsSection: React.FC<AccountSettingsSectionProps> = ({
  account,
  onPasswordChanged,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formattedDate = account.createdAt
    ? new Date(account.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (account.hasPassword && !currentPassword) {
        throw new Error('Please enter your current password.');
      }
      if (!newPassword || newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long.');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match.');
      }

      await updatePassword({
        currentPassword: account.hasPassword ? currentPassword : undefined,
        newPassword,
        confirmPassword,
      });

      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onPasswordChanged) onPasswordChanged();
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Account Details */}
      <Card className="w-full">
        <CardHeader className="pb-4">
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" /> Account Identity
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Your canonical sign-in and security credentials.</p>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Registered Email
              </span>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{account.email}</p>
                <Badge variant="success" size="sm" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">Primary authentication address (read-only)</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Member Since
              </span>
              <p className="text-sm font-medium text-slate-800">{formattedDate}</p>
              <p className="text-[11px] text-slate-400">Account creation timestamp</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Connected Identity Providers
            </span>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Google Account</p>
                  <p className="text-[11px] text-slate-500">Fast one-click sign in</p>
                </div>
              </div>

              <div>
                {account.hasGoogleLinked ? (
                  <Badge variant="success" size="sm" className="gap-1">
                    <Check className="w-3 h-3" /> Connected
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">Not connected</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Password & Security */}
      <Card className="w-full">
        <CardHeader className="pb-4">
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-600" /> Password & Security
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {account.hasPassword
              ? 'Update your account password with standard cryptographic hashing.'
              : 'Add a password to your account for alternate email/password login.'}
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {message && (
            <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
            {account.hasPassword && (
              <Input
                label="Current Password *"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            )}

            <Input
              label={account.hasPassword ? 'New Password *' : 'Create Password *'}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              hint="Must be at least 8 characters long"
              required
            />

            <Input
              label="Confirm New Password *"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                {account.hasPassword ? 'Update Password' : 'Set Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
