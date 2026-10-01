'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { AdminBreadcrumbs } from '@/components/AdminBreadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { fetchAdminApi } from '@/lib/apiHelper';
import { MentorDetailDTO } from '@backend/types/admin';
import {
  Compass,
  CheckCircle,
  XCircle,
  Briefcase,
  Star,
  Award,
  AlertCircle,
  ShieldAlert,
  Clock,
} from 'lucide-react';

export default function MentorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const [mentor, setMentor] = useState<MentorDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dialogs
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);

  const fetchMentor = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchAdminApi<{ mentor: MentorDetailDTO }>(
        `/api/admin/mentors/${params.id}`
      );
      setMentor(res.mentor);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mentor details');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchMentor();
  }, [fetchMentor]);

  const handleApprove = async () => {
    try {
      setError(null);
      await fetchAdminApi(`/api/admin/mentors/${params.id}/approve`, {
        method: 'POST',
      });
      setSuccessMessage('Mentor application successfully approved!');
      fetchMentor();
    } catch (err: any) {
      setError(err.message || 'Failed to approve mentor');
    }
  };

  const handleReject = async (reason?: string) => {
    try {
      setError(null);
      await fetchAdminApi(`/api/admin/mentors/${params.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      setSuccessMessage('Mentor application rejected.');
      fetchMentor();
    } catch (err: any) {
      setError(err.message || 'Failed to reject mentor');
    }
  };

  const handleSuspend = async (reason?: string) => {
    try {
      setError(null);
      await fetchAdminApi(`/api/admin/mentors/${params.id}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      setSuccessMessage('Mentor account suspended.');
      fetchMentor();
    } catch (err: any) {
      setError(err.message || 'Failed to suspend mentor');
    }
  };

  if (isLoading) {
    return (
      <AdminShell title="Mentor Application Review">
        <div className="p-12 text-center text-xs text-slate-500 font-mono">
          LOADING MENTOR RECORD...
        </div>
      </AdminShell>
    );
  }

  if (error || !mentor) {
    return (
      <AdminShell title="Mentor Application Review">
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs shadow-sm">
          {error || 'Mentor not found'}
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Mentor Review & Verification">
      <AdminBreadcrumbs
        items={[
          { label: 'Mentors', href: '/mentors' },
          { label: mentor.name },
        ]}
      />

      <div className="space-y-6">
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {mentor.status === 'REJECTED' && mentor.rejectionReason && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Application Previously Rejected</span>
              <p className="mt-0.5 text-rose-700">{mentor.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Top Header Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl font-bold text-blue-600 shadow-sm">
              {mentor.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 font-display tracking-tight">{mentor.name}</h2>
                <StatusBadge status={mentor.status} size="md" />
              </div>
              <p className="text-xs text-slate-700 mt-1 font-medium">{mentor.headline}</p>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{mentor.email}</span>
                <span>·</span>
                <span>{mentor.domain}</span>
                {mentor.company && (
                  <>
                    <span>·</span>
                    <span>{mentor.company}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {mentor.status !== 'APPROVED' && (
              <button
                onClick={() => setApproveModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve Mentor</span>
              </button>
            )}

            {mentor.status !== 'REJECTED' && mentor.status !== 'SUSPENDED' && (
              <button
                onClick={() => setRejectModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            )}

            {mentor.status === 'APPROVED' && (
              <button
                onClick={() => setSuspendModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Suspend</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Experience</span>
            <div className="text-base font-bold text-slate-900 mt-1 font-display">
              {mentor.experienceYears} Years
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Starting Fee</span>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono">
              ₹{mentor.startingPrice.toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Sessions Completed</span>
            <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>{mentor.sessionCount} Sessions</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Rating</span>
            <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{mentor.rating.toFixed(1)} ({mentor.reviewCount})</span>
            </div>
          </div>
        </div>

        {/* Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>Areas of Expertise</span>
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {mentor.expertise.map((exp, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700 font-medium"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Offered Session Types</span>
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {mentor.sessionTypes.map((st, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium"
                  >
                    {st}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Skills & Technologies
              </h3>
              <div className="flex flex-wrap gap-1 pt-1">
                {mentor.skillsList.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Biography & Professional Overview
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {mentor.bio}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <ConfirmDialog
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={handleApprove}
        title="Approve Mentor"
        message={`Approve ${mentor.name} as an active mentor? This publishes their profile to candidate discovery and grants them MENTOR platform role.`}
        confirmLabel="Approve Mentor"
        variant="primary"
      />

      {/* Reject Dialog */}
      <ConfirmDialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleReject}
        title="Reject Mentor Application"
        message={`Provide an administrative reason for rejecting ${mentor.name}. This reason is recorded in the platform audit log.`}
        confirmLabel="Reject Application"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Provide the administrative reason for rejection..."
      />

      {/* Suspend Dialog */}
      <ConfirmDialog
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        onConfirm={handleSuspend}
        title="Suspend Mentor"
        message={`Suspend ${mentor.name} from active mentorship bookings?`}
        confirmLabel="Suspend Mentor"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Provide suspension reason..."
      />
    </AdminShell>
  );
}
