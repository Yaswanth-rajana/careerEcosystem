'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { AdminBreadcrumbs } from '@/components/AdminBreadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { fetchAdminApi } from '@/lib/apiHelper';
import { JobAdminDetailDTO } from '@backend/types/admin';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Sparkles,
  CheckCircle,
  Archive,
  PauseCircle,
  XCircle,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const [job, setJob] = useState<JobAdminDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Moderate Status Dialog
  const [targetStatus, setTargetStatus] = useState<string | null>(null);
  const [moderateModalOpen, setModerateModalOpen] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchAdminApi<{ job: JobAdminDetailDTO }>(
        `/api/admin/jobs/${params.id}`
      );
      setJob(res.job);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch job details');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleUpdateStatus = async (status: string, reason?: string) => {
    try {
      setError(null);
      await fetchAdminApi(`/api/admin/jobs/${params.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      });
      setSuccessMessage(`Job status updated to ${status}.`);
      fetchJob();
    } catch (err: any) {
      setError(err.message || 'Failed to update job status');
    }
  };

  const handleToggleVerified = async () => {
    if (!job) return;
    try {
      await fetchAdminApi(`/api/admin/jobs/${params.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: job.status,
          jobVerified: !job.jobVerified,
        }),
      });
      fetchJob();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle verification');
    }
  };

  const handleToggleFeatured = async () => {
    if (!job) return;
    try {
      await fetchAdminApi(`/api/admin/jobs/${params.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: job.status,
          featured: !job.featured,
        }),
      });
      fetchJob();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle featured status');
    }
  };

  if (isLoading) {
    return (
      <AdminShell title="Job Moderation Review">
        <div className="p-12 text-center text-xs text-slate-500 font-mono">
          LOADING JOB SPECIFICATION...
        </div>
      </AdminShell>
    );
  }

  if (error || !job) {
    return (
      <AdminShell title="Job Moderation Review">
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs shadow-sm">
          {error || 'Job not found'}
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Job Listing Moderation">
      <AdminBreadcrumbs
        items={[
          { label: 'Job Listings', href: '/jobs' },
          { label: `${job.title} (${job.company})` },
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

        {/* Top Header Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-1">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight">{job.title}</h2>
                <StatusBadge status={job.status} size="md" />
                {job.jobVerified && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                {job.featured && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Featured
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-700 mt-1">{job.company}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {job.location} · {job.workMode} · {job.employmentType} · {job.experienceLevel}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleToggleVerified}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                job.jobVerified
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{job.jobVerified ? 'Verified' : 'Verify Job'}</span>
            </button>

            <button
              onClick={handleToggleFeatured}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                job.featured
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{job.featured ? 'Featured' : 'Feature Job'}</span>
            </button>

            {job.status !== 'PUBLISHED' && (
              <button
                onClick={() => {
                  setTargetStatus('PUBLISHED');
                  setModerateModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
            )}

            {job.status === 'PUBLISHED' && (
              <button
                onClick={() => {
                  setTargetStatus('PAUSED');
                  setModerateModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            )}

            {job.status !== 'CLOSED' && job.status !== 'ARCHIVED' && (
              <button
                onClick={() => {
                  setTargetStatus('CLOSED');
                  setModerateModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
              >
                Close
              </button>
            )}

            {job.status !== 'ARCHIVED' && (
              <button
                onClick={() => {
                  setTargetStatus('ARCHIVED');
                  setModerateModalOpen(true);
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors border border-slate-200"
                title="Archive Job"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Compensation</span>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono">
              {job.salaryMin && job.salaryMax
                ? `₹${(job.salaryMin / 100000).toFixed(1)}L – ₹${(job.salaryMax / 100000).toFixed(1)}L`
                : 'Not disclosed'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Applications</span>
            <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>{job.applicationsCount} Submitted</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Work Mode</span>
            <div className="text-base font-bold text-slate-900 mt-1">{job.workMode}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Posted Date</span>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono text-xs">
              {job.publishedAt ? new Date(job.publishedAt).toLocaleDateString() : 'Draft'}
            </div>
          </div>
        </div>

        {/* Job Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {job.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {job.benefits.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
                  Offered Benefits
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                  {job.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
                Job Description
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>

              {job.responsibilities.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">
                    Responsibilities
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                    {job.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.requirements.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">
                    Requirements
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                    {job.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Moderation Status Dialog */}
      <ConfirmDialog
        isOpen={moderateModalOpen}
        onClose={() => setModerateModalOpen(false)}
        onConfirm={(reason) => {
          if (targetStatus) return handleUpdateStatus(targetStatus, reason);
        }}
        title={`Change Job Status to ${targetStatus}`}
        message={`Confirm changing the moderation status of "${job.title}" to ${targetStatus}? This action is auditable.`}
        confirmLabel="Update Status"
        variant={targetStatus === 'ARCHIVED' || targetStatus === 'CLOSED' ? 'danger' : 'primary'}
        requireReason={targetStatus === 'ARCHIVED' || targetStatus === 'CLOSED'}
        reasonPlaceholder="Provide operational reason for this moderation change..."
      />
    </AdminShell>
  );
}
