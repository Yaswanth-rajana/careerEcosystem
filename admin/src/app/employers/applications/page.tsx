'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { AdminTable, Column } from '@/components/AdminTable';
import { AdminPagination } from '@/components/AdminPagination';
import { AdminSearch } from '@/components/AdminSearch';
import { AdminFilters, FilterConfig } from '@/components/AdminFilters';
import { StatusBadge } from '@/components/StatusBadge';
import { AdminModal } from '@/components/AdminModal';
import { fetchAdminApi } from '@/lib/apiHelper';
import {
  EmployerApplicationListDTO,
  EmployerApplicationDetailDTO,
} from '@backend/types/employerApplication';
import { PaginatedAdminResult } from '@backend/types/admin';
import {
  Building2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  ExternalLink,
  MapPin,
  Users,
  Briefcase,
  Globe,
  RotateCw,
} from 'lucide-react';

export default function AdminEmployerApplicationsPage() {
  const [data, setData] = useState<PaginatedAdminResult<EmployerApplicationListDTO>>({
    items: [],
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Inspector & Action modals
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [appDetail, setAppDetail] = useState<EmployerApplicationDetailDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Resend / Feedback message
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(q.trim() ? { q: q.trim() } : {}),
        ...(status !== 'All' ? { status } : {}),
      });

      const res = await fetchAdminApi<PaginatedAdminResult<EmployerApplicationListDTO>>(
        `/api/admin/employer-applications?${params.toString()}`
      );
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, q, status]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleInspect = async (appId: string) => {
    try {
      setSelectedAppId(appId);
      setModalOpen(true);
      setDetailLoading(true);
      setFeedbackMessage(null);
      const res = await fetchAdminApi<{ application: EmployerApplicationDetailDTO }>(
        `/api/admin/employer-applications/${appId}`
      );
      setAppDetail(res.application);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStartReview = async (appId: string) => {
    try {
      setActionLoading(true);
      const res = await fetchAdminApi<{ application: EmployerApplicationDetailDTO }>(
        `/api/admin/employer-applications/${appId}/review`,
        { method: 'POST' }
      );
      setAppDetail(res.application);
      fetchApplications();
      setFeedbackMessage({ text: 'Application marked as Under Review.', type: 'success' });
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Failed to update review status.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (appId: string) => {
    if (!confirm('Are you sure you want to approve this employer? This will create an active Recruiter account, provision their Company workspace, and send an invitation email.')) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetchAdminApi<{ application: EmployerApplicationDetailDTO; message: string }>(
        `/api/admin/employer-applications/${appId}/approve`,
        { method: 'POST', body: JSON.stringify({}) }
      );
      setAppDetail(res.application);
      fetchApplications();
      setFeedbackMessage({ text: res.message || 'Employer application successfully approved!', type: 'success' });
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Failed to approve application.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedAppId) return;
    try {
      setActionLoading(true);
      const res = await fetchAdminApi<{ application: EmployerApplicationDetailDTO }>(
        `/api/admin/employer-applications/${selectedAppId}/reject`,
        {
          method: 'POST',
          body: JSON.stringify({ decisionReason: rejectReason }),
        }
      );
      setAppDetail(res.application);
      setRejectModalOpen(false);
      setRejectReason('');
      fetchApplications();
      setFeedbackMessage({ text: 'Application rejected and notification sent.', type: 'success' });
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Failed to reject application.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendWelcome = async (appId: string) => {
    try {
      setActionLoading(true);
      const res = await fetchAdminApi<{ message: string }>(
        `/api/admin/employer-applications/${appId}/resend-welcome`,
        { method: 'POST' }
      );
      setFeedbackMessage({ text: res.message || 'Setup email resent successfully.', type: 'success' });
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Failed to resend setup email.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const filterConfigs: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      value: status,
      onChange: (val) => {
        setStatus(val);
        setPage(1);
      },
      options: [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Under Review', value: 'UNDER_REVIEW' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Rejected', value: 'REJECTED' },
      ],
    },
  ];

  const columns: Column<EmployerApplicationListDTO>[] = [
    {
      key: 'referenceId',
      header: 'Reference',
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-slate-800">
          {item.referenceId}
        </span>
      ),
    },
    {
      key: 'companyName',
      header: 'Company & Industry',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{item.companyName}</span>
          <span className="text-xs text-slate-500">{item.industry} &bull; {item.companySize}</span>
        </div>
      ),
    },
    {
      key: 'fullName',
      header: 'Applicant',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">{item.fullName}</span>
          <span className="text-xs text-slate-500">{item.designation}</span>
        </div>
      ),
    },
    {
      key: 'workEmail',
      header: 'Work Email',
      render: (item) => (
        <span className="text-xs text-slate-600 font-mono">
          {item.workEmail}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (item) => (
        <span className="text-xs text-slate-500">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleInspect(item.id)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Inspect Application"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell
      title="Employer Applications"
      subtitle="Verify companies, review hiring preferences, and approve recruiter workspaces."
    >
      <div className="space-y-4">
        {feedbackMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{feedbackMessage.text}</span>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              &times;
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-full sm:w-80">
            <AdminSearch
              value={q}
              onChange={(val) => {
                setQ(val);
                setPage(1);
              }}
              placeholder="Search company, applicant, email..."
            />
          </div>
          <div className="flex items-center gap-2">
            <AdminFilters
              filters={filterConfigs}
              onReset={() => {
                setStatus('All');
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <AdminTable
            columns={columns}
            data={data.items}
            isLoading={isLoading}
            emptyMessage="No employer applications found matching your criteria."
          />
        </div>

        {/* Server Pagination */}
        <AdminPagination
          currentPage={page}
          totalPages={data.totalPages}
          totalItems={data.total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </div>

      {/* INSPECTOR DRAWER / MODAL */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={appDetail ? `${appDetail.companyName} — Application Review` : 'Application Details'}
        maxWidth="lg"
      >
        {detailLoading || !appDetail ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            <span className="text-xs text-slate-500 font-mono">Loading application details...</span>
          </div>
        ) : (
          <div className="space-y-6 text-sm">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{appDetail.companyName}</h3>
                  <p className="text-xs text-slate-500 font-mono">Ref: {appDetail.referenceId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={appDetail.status} />
              </div>
            </div>

            {/* Grid of details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* About Applicant */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Applicant Details</h4>
                <div>
                  <span className="text-xs text-slate-500">Name:</span>
                  <p className="font-semibold text-slate-800">{appDetail.fullName}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Designation:</span>
                  <p className="text-slate-800">{appDetail.designation}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Work Email:</span>
                  <p className="text-slate-800 font-mono text-xs">{appDetail.workEmail}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Phone:</span>
                  <p className="text-slate-800">{appDetail.phone}</p>
                </div>
                {appDetail.linkedInUrl && (
                  <div>
                    <a
                      href={appDetail.linkedInUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> View LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Company Overview</h4>
                <div>
                  <span className="text-xs text-slate-500">Industry:</span>
                  <p className="font-semibold text-slate-800">{appDetail.industry}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Size:</span>
                  <p className="text-slate-800">{appDetail.companySize} employees</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Headquarters:</span>
                  <p className="text-slate-800">{appDetail.headquartersLocation}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Website:</span>
                  <p>
                    <a
                      href={appDetail.companyWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" /> {appDetail.companyWebsite}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Hiring Preferences */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Hiring Profile</h4>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Commonly Hired Roles:</span>
                <div className="flex flex-wrap gap-1.5">
                  {appDetail.rolesHired.map((role, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-xs text-slate-500">Hiring Volume:</span>
                  <p className="text-slate-800 font-medium">{appDetail.hiringVolume || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Work Modes:</span>
                  <p className="text-slate-800 font-medium">{appDetail.workModes.join(', ') || 'Any'}</p>
                </div>
              </div>
              {appDetail.verificationNotes && (
                <div className="pt-2">
                  <span className="text-xs text-slate-500">Applicant Notes / Verification Info:</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                    {appDetail.verificationNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                {appDetail.status === 'PENDING' && (
                  <button
                    onClick={() => handleStartReview(appDetail.id)}
                    disabled={actionLoading}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" /> Mark Under Review
                  </button>
                )}
                {appDetail.status === 'APPROVED' && (
                  <button
                    onClick={() => handleResendWelcome(appDetail.id)}
                    disabled={actionLoading}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Resend Activation Email
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {appDetail.status !== 'REJECTED' && appDetail.status !== 'APPROVED' && (
                  <button
                    onClick={() => setRejectModalOpen(true)}
                    disabled={actionLoading}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
                {appDetail.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleApprove(appDetail.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Provision Portal
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* REJECTION REASON MODAL */}
      <AdminModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Employer Application"
        maxWidth="md"
      >
        <div className="space-y-4 text-sm">
          <p className="text-xs text-slate-600">
            Please provide a reason for rejecting this employer application. This note will be sent to the applicant.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            placeholder="e.g. Unable to verify official company website / work domain..."
          />
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectConfirm}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </AdminModal>
    </AdminShell>
  );
}
