'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminShell } from '@/components/AdminShell';
import { AdminBreadcrumbs } from '@/components/AdminBreadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { fetchAdminApi } from '@/lib/apiHelper';
import { MentorApplicationDetailDTO } from '@backend/types/admin';
import {
  Compass,
  CheckCircle,
  XCircle,
  ExternalLink,
  Clock,
  Briefcase,
  Layers,
  Award,
  AlertCircle,
  Mail,
  RotateCcw,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

export default function AdminMentorApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const [application, setApplication] = useState<MentorApplicationDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Action Modals
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [resendModalOpen, setResendModalOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');

  const fetchApplication = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchAdminApi<{ application: MentorApplicationDetailDTO }>(
        `/api/admin/mentor-applications/${params.id}`
      );
      setApplication(res.application);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch application details');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleStartReview = async () => {
    try {
      setError(null);
      await fetchAdminApi(`/api/admin/mentor-applications/${params.id}/review`, {
        method: 'POST',
      });
      setSuccessMessage('Application marked as Under Review.');
      fetchApplication();
    } catch (err: any) {
      setError(err.message || 'Failed to update review status.');
    }
  };

  const handleApprove = async () => {
    try {
      setError(null);
      await fetchAdminApi(`/api/admin/mentor-applications/${params.id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ internalNotes }),
      });
      setSuccessMessage('Mentor application approved! Account provisioned and welcome email dispatched.');
      setApproveModalOpen(false);
      fetchApplication();
    } catch (err: any) {
      setError(err.message || 'Failed to approve application.');
    }
  };

  const handleReject = async (reason?: string) => {
    try {
      setError(null);
      await fetchAdminApi(`/api/admin/mentor-applications/${params.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason, internalNotes }),
      });
      setSuccessMessage('Mentor application rejected. Feedback email dispatched.');
      setRejectModalOpen(false);
      fetchApplication();
    } catch (err: any) {
      setError(err.message || 'Failed to reject application.');
    }
  };

  const handleResendWelcome = async () => {
    try {
      setError(null);
      const res = await fetchAdminApi<{ message: string }>(
        `/api/admin/mentor-applications/${params.id}/resend-welcome`,
        { method: 'POST' }
      );
      setSuccessMessage(res.message || 'New welcome email and setup link sent.');
      setResendModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to resend welcome email.');
    }
  };

  if (isLoading) {
    return (
      <AdminShell title="Mentor Application Review">
        <div className="p-16 text-center text-xs text-slate-500 font-mono">
          LOADING APPLICATION DATA...
        </div>
      </AdminShell>
    );
  }

  if (error || !application) {
    return (
      <AdminShell title="Mentor Application Review">
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs shadow-sm">
          {error || 'Application not found'}
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Mentor Application Verification">
      <AdminBreadcrumbs
        items={[
          { label: 'Mentors & Applications', href: '/mentors' },
          { label: application.fullName },
        ]}
      />

      <div className="space-y-6">
        {/* Banner feedback */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Header Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl font-bold text-blue-600 shadow-sm">
              {application.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 font-display tracking-tight">
                  {application.fullName}
                </h2>
                <StatusBadge status={application.status} size="md" />
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-semibold">
                  {application.referenceId}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1 font-medium">
                {application.currentRole}
                {application.company && ` at ${application.company}`}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{application.email}</span>
                <span>•</span>
                <span>{application.phone}</span>
                {application.location && (
                  <>
                    <span>•</span>
                    <span>{application.location}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {application.status === 'PENDING' && (
              <button
                onClick={handleStartReview}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Begin Review</span>
              </button>
            )}

            {application.status !== 'APPROVED' && (
              <button
                onClick={() => setApproveModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve Mentor</span>
              </button>
            )}

            {application.status === 'APPROVED' && (
              <button
                onClick={() => setResendModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                title="Invalidates previous password setup token and dispatches a fresh welcome link"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resend Welcome Email</span>
              </button>
            )}

            {application.status !== 'REJECTED' && (
              <button
                onClick={() => setRejectModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            )}
          </div>
        </div>

        {/* Overview Metric Strips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Experience</span>
            <div className="text-base font-bold text-slate-900 mt-1 font-display">
              {application.experienceYears} Years
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Domain</span>
            <div className="text-base font-bold text-slate-900 mt-1 truncate">
              {application.domain}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Session Duration</span>
            <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{application.preferredSessionDuration} Mins</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Submitted On</span>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono text-xs">
              {new Date(application.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Rejection Notification if Rejected */}
        {application.status === 'REJECTED' && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2 text-left">
            <div className="flex items-center gap-2 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Application Rejected</span>
            </div>
            {application.decisionReason && (
              <p className="text-xs text-rose-800 leading-relaxed">
                <strong>Applicant-visible Feedback:</strong> {application.decisionReason}
              </p>
            )}
            {application.internalAdminNotes && (
              <p className="text-xs text-rose-700/90 leading-relaxed italic border-t border-rose-200 pt-1">
                <strong>Internal Admin Notes:</strong> {application.internalAdminNotes}
              </p>
            )}
          </div>
        )}

        {/* 2-Column Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Left Column: Expertise & Links */}
          <div className="space-y-6">
            {/* Areas of Expertise */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>Areas of Expertise</span>
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {application.expertise.map((exp, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700 font-medium"
                  >
                    {exp}
                  </span>
                ))}
              </div>
              {application.additionalExpertise && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500 block font-semibold">Additional Expertise:</span>
                  <p className="text-xs text-slate-700 mt-0.5">{application.additionalExpertise}</p>
                </div>
              )}
            </div>

            {/* Mentorship Offerings */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mentorship Offerings</span>
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {application.offerings.map((off, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium"
                  >
                    {off}
                  </span>
                ))}
              </div>
            </div>

            {/* External Profile Links */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Verified Profiles &amp; Portfolios
              </h3>
              <div className="space-y-2 pt-1 text-xs">
                {application.linkedIn ? (
                  <a
                    href={application.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 text-blue-600 transition"
                  >
                    <span className="font-semibold">LinkedIn Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="text-slate-400 text-xs">No LinkedIn provided</div>
                )}

                {application.gitHub && (
                  <a
                    href={application.gitHub}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 text-slate-700 hover:text-blue-600 transition"
                  >
                    <span className="font-semibold">GitHub Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {application.portfolio && (
                  <a
                    href={application.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 text-slate-700 hover:text-blue-600 transition"
                  >
                    <span className="font-semibold">Portfolio / Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Review History */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Review History</h3>
              <div className="space-y-1.5 text-slate-600 pt-1">
                {application.reviewedBy && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Reviewed By</span>
                    <span className="font-semibold text-slate-800">{application.reviewedBy}</span>
                  </div>
                )}
                {application.reviewedAt && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Reviewed At</span>
                    <span className="font-mono text-slate-700">
                      {new Date(application.reviewedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {application.approvedAt && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Approved At</span>
                    <span className="font-mono text-emerald-700 font-semibold">
                      {new Date(application.approvedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Motivation & Application Answers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Why Mentor */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Why do you want to become a mentor?
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                {application.whyMentor}
              </p>
            </div>

            {/* Who to Help */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Who would you like to help?
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                {application.whoToHelp}
              </p>
            </div>

            {/* Additional Info */}
            {application.additionalInfo && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Additional Notes
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                  {application.additionalInfo}
                </p>
              </div>
            )}

            {/* Linked User Identity */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Account Identity &amp; Linking</span>
              </h3>
              {application.user ? (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-emerald-900">
                    Linked to User Account: {application.user.email}
                  </div>
                  <div className="text-emerald-700 text-[11px]">
                    Role: <strong className="font-mono">{application.user.role}</strong> • Status:{' '}
                    <strong>{application.user.status}</strong>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  No existing account linked. Upon approval, an account will be securely provisioned with MENTOR role.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <ConfirmDialog
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={handleApprove}
        title="Approve Mentor Application"
        message={`Authorize ${application.fullName} as an official PATHWAY.ECO mentor? This will activate their User account with role MENTOR, create their MentorProfile, generate a 24-hour setup token, and dispatch a welcome email.`}
        confirmLabel="Approve & Send Welcome"
        variant="primary"
      />

      {/* Reject Dialog */}
      <ConfirmDialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleReject}
        title="Reject Mentor Application"
        message={`Provide an administrative feedback reason for ${application.fullName}. This reason will be politely communicated to the applicant via email.`}
        confirmLabel="Reject Application"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Specify reason (e.g. Seeking mentors with 5+ years for this cohort, domain cluster full...)"
      />

      {/* Resend Welcome Dialog */}
      <ConfirmDialog
        isOpen={resendModalOpen}
        onClose={() => setResendModalOpen(false)}
        onConfirm={handleResendWelcome}
        title="Resend Welcome Email"
        message={`Invalidate previous setup links and send a new 24-hour activation link to ${application.email}?`}
        confirmLabel="Resend Email"
        variant="primary"
      />
    </AdminShell>
  );
}
