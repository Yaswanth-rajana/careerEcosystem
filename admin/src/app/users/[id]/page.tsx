'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { AdminBreadcrumbs } from '@/components/AdminBreadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { fetchAdminApi } from '@/lib/apiHelper';
import { useAdminAuth } from '@/lib/adminAuthContext';
import { UserDetailDTO } from '@backend/types/admin';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
  Target,
  ShieldAlert,
  CheckCircle,
  FileCheck,
  Bookmark,
} from 'lucide-react';

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { admin } = useAdminAuth();

  const [user, setUser] = useState<UserDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchAdminApi<{ user: UserDetailDTO }>(
        `/api/admin/users/${params.id}`
      );
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user details');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleUpdateStatus = async (status: 'ACTIVE' | 'SUSPENDED', reason?: string) => {
    await fetchAdminApi(`/api/admin/users/${params.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
    fetchUser();
  };

  if (isLoading) {
    return (
      <AdminShell title="User Profile Inspection">
        <div className="p-12 text-center text-xs text-slate-500 font-mono">
          LOADING STUDENT RECORD...
        </div>
      </AdminShell>
    );
  }

  if (error || !user) {
    return (
      <AdminShell title="User Profile Inspection">
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs shadow-sm">
          {error || 'User not found'}
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Candidate Profile Inspection">
      <AdminBreadcrumbs
        items={[
          { label: 'Students Directory', href: '/users' },
          { label: user.name },
        ]}
      />

      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl font-bold font-display text-blue-600">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight">{user.name}</h2>
                <StatusBadge status={user.role} size="md" />
                <StatusBadge status={user.status} size="md" />
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>{user.email}</span>
                <span>·</span>
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {user.status === 'ACTIVE' ? (
              <button
                onClick={() => setSuspendModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Suspend Account</span>
              </button>
            ) : (
              <button
                onClick={() => setReactivateModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reactivate Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Onboarding</span>
            <div className="text-base font-bold text-slate-900 mt-1">
              {user.isOnboarded ? 'Completed' : 'Pending'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Candidate Type</span>
            <div className="text-base font-bold text-slate-900 mt-1">
              {user.profile?.candidateType || 'Student'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Applications</span>
            <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>{user.applicationsCount} Submitted</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Saved Jobs</span>
            <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-amber-600" />
              <span>{user.savedJobsCount} Saved</span>
            </div>
          </div>
        </div>

        {/* Detail Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Profile & Career Direction (1 col) */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Basic Profile</span>
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                {user.profile?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.profile.phone}</span>
                  </div>
                )}
                {user.profile?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.profile.location}</span>
                  </div>
                )}
                {user.profile?.headline && (
                  <p className="text-slate-800 font-medium pt-2 border-t border-slate-100">
                    &ldquo;{user.profile.headline}&rdquo;
                  </p>
                )}
                {user.profile?.bio && (
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {user.profile.bio}
                  </p>
                )}
              </div>
            </div>

            {user.profile?.careerGoal && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Target Career Goal</span>
                </h3>
                <div className="text-xs space-y-1.5">
                  <span className="font-semibold text-slate-900 text-sm block">
                    {user.profile.careerGoal.targetRole}
                  </span>
                  {user.profile.careerGoal.targetIndustry && (
                    <span className="text-slate-500 block">
                      Industry: {user.profile.careerGoal.targetIndustry}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Column 2 & 3: Skills, Experience, Education, Projects (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Skills & Expertise</span>
              </h3>

              {!user.profile?.skills || user.profile.skills.length === 0 ? (
                <p className="text-xs text-slate-400">No skills recorded yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {user.profile.skills.map((s) => (
                    <span
                      key={s.id}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium flex items-center gap-1.5"
                    >
                      <span>{s.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({s.level})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Experience Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                <span>Experience History</span>
              </h3>

              {!user.profile?.experience || user.profile.experience.length === 0 ? (
                <p className="text-xs text-slate-400">No work experience listed.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {user.profile.experience.map((exp) => (
                    <div key={exp.id} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-slate-900">{exp.roleTitle}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate || '—'}
                        </span>
                      </div>
                      <span className="text-slate-500 block">{exp.company}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                <span>Education</span>
              </h3>

              {!user.profile?.education || user.profile.education.length === 0 ? (
                <p className="text-xs text-slate-400">No education entries listed.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {user.profile.education.map((edu) => (
                    <div key={edu.id} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-slate-900">
                          {edu.degree} in {edu.fieldOfStudy}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {edu.startYear} – {edu.endYear || 'Present'}
                        </span>
                      </div>
                      <span className="text-slate-500 block">{edu.institution}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects Card */}
            {user.profile?.projects && user.profile.projects.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display flex items-center gap-2">
                  <FolderGit2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Projects</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.profile.projects.map((proj) => (
                    <div key={proj.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-900 block">{proj.title}</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj.technologies.map((t, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suspend Confirmation Dialog */}
      <ConfirmDialog
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        onConfirm={(reason) => handleUpdateStatus('SUSPENDED', reason)}
        title="Suspend Candidate Account"
        message={`Are you sure you want to suspend the account of ${user.name}? This will revoke all active sessions immediately.`}
        confirmLabel="Suspend Account"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Provide the administrative reason for suspension (e.g. Terms violation)..."
      />

      {/* Reactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={reactivateModalOpen}
        onClose={() => setReactivateModalOpen(false)}
        onConfirm={(reason) => handleUpdateStatus('ACTIVE', reason)}
        title="Reactivate Account"
        message={`Reactivate the account for ${user.name}? They will be permitted to log in again.`}
        confirmLabel="Reactivate Account"
        variant="primary"
        requireReason={false}
      />
    </AdminShell>
  );
}
