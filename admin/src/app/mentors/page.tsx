'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { AdminTable, Column } from '@/components/AdminTable';
import { AdminPagination } from '@/components/AdminPagination';
import { AdminSearch } from '@/components/AdminSearch';
import { AdminFilters, FilterConfig } from '@/components/AdminFilters';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { fetchAdminApi } from '@/lib/apiHelper';
import {
  MentorListDTO,
  MentorApplicationListDTO,
  PaginatedAdminResult,
} from '@backend/types/admin';
import {
  CheckCircle,
  XCircle,
  Eye,
  RotateCcw,
  Clock,
  Compass,
  Briefcase,
  FileText,
  Users,
} from 'lucide-react';

export default function AdminMentorsPage() {
  const router = useRouter();

  // Active Tab: 'applications' (inbound mentor applications) or 'directory' (active mentors)
  const [activeTab, setActiveTab] = useState<'applications' | 'directory'>('applications');

  // Application Data State
  const [appsData, setAppsData] = useState<PaginatedAdminResult<MentorApplicationListDTO>>({
    items: [],
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });

  // Mentors Directory Data State
  const [mentorsData, setMentorsData] = useState<PaginatedAdminResult<MentorListDTO>>({
    items: [],
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState('');
  const [domain, setDomain] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Quick Action Dialogs
  const [selectedApp, setSelectedApp] = useState<MentorApplicationListDTO | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [resendModalOpen, setResendModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Fetch Applications
  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(q.trim() ? { q: q.trim() } : {}),
        ...(domain !== 'All' ? { domain } : {}),
        ...(status !== 'All' ? { status } : {}),
      });

      const res = await fetchAdminApi<PaginatedAdminResult<MentorApplicationListDTO>>(
        `/api/admin/mentor-applications?${params.toString()}`
      );
      setAppsData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, q, domain, status]);

  // Fetch Directory Mentors
  const fetchMentors = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(q.trim() ? { q: q.trim() } : {}),
        ...(domain !== 'All' ? { domain } : {}),
        ...(status !== 'All' ? { status } : {}),
      });

      const res = await fetchAdminApi<PaginatedAdminResult<MentorListDTO>>(
        `/api/admin/mentors?${params.toString()}`
      );
      setMentorsData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, q, domain, status]);

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications();
    } else {
      fetchMentors();
    }
  }, [activeTab, fetchApplications, fetchMentors]);

  // Quick Action Handlers
  const handleStartReview = async (appId: string) => {
    try {
      await fetchAdminApi(`/api/admin/mentor-applications/${appId}/review`, {
        method: 'POST',
      });
      setSuccessBanner('Application status updated to Under Review.');
      fetchApplications();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    try {
      await fetchAdminApi(`/api/admin/mentor-applications/${selectedApp.id}/approve`, {
        method: 'POST',
      });
      setSuccessBanner(`Application approved for ${selectedApp.fullName}. Account provisioned.`);
      fetchApplications();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleReject = async (reason?: string) => {
    if (!selectedApp) return;
    try {
      await fetchAdminApi(`/api/admin/mentor-applications/${selectedApp.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      setSuccessBanner(`Application rejected for ${selectedApp.fullName}.`);
      fetchApplications();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleResendWelcome = async () => {
    if (!selectedApp) return;
    try {
      const res = await fetchAdminApi<{ message: string }>(
        `/api/admin/mentor-applications/${selectedApp.id}/resend-welcome`,
        { method: 'POST' }
      );
      setSuccessBanner(res.message || 'Fresh welcome email dispatched.');
      setResendModalOpen(false);
    } catch (err: any) {
      console.error(err);
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
        { label: 'Pending Approval', value: 'PENDING' },
        { label: 'Under Review', value: 'UNDER_REVIEW' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Rejected', value: 'REJECTED' },
        ...(activeTab === 'directory' ? [{ label: 'Suspended', value: 'SUSPENDED' }] : []),
      ],
    },
    {
      key: 'domain',
      label: 'Domain',
      value: domain,
      onChange: (val) => {
        setDomain(val);
        setPage(1);
      },
      options: [
        { label: 'Software Engineering', value: 'Software Engineering' },
        { label: 'AI / Data Science', value: 'AI / Data Science' },
        { label: 'Product Management', value: 'Product Management' },
        { label: 'Engineering Leadership', value: 'Engineering Leadership' },
        { label: 'Design & UX', value: 'Design & UX' },
      ],
    },
  ];

  const handleResetFilters = () => {
    setQ('');
    setDomain('All');
    setStatus('All');
    setPage(1);
  };

  // Columns for Applications Tab
  const applicationColumns: Column<MentorApplicationListDTO>[] = [
    {
      key: 'fullName',
      header: 'Applicant',
      render: (app) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs text-blue-600 shrink-0 shadow-sm">
            {app.fullName.charAt(0)}
          </div>
          <div className="flex flex-col truncate">
            <span className="font-semibold text-slate-900 truncate">{app.fullName}</span>
            <span className="text-[11px] text-slate-500 truncate">{app.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'referenceId',
      header: 'Application Ref',
      render: (app) => (
        <span className="font-mono text-xs font-semibold text-blue-600 px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
          {app.referenceId}
        </span>
      ),
    },
    {
      key: 'domain',
      header: 'Domain & Experience',
      render: (app) => (
        <div className="flex flex-col truncate">
          <span className="font-medium text-slate-700">{app.domain}</span>
          <span className="text-[11px] text-slate-500">
            {app.currentRole} • {app.experienceYears} Yrs Exp
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (app) => <StatusBadge status={app.status} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (app) => (
        <span className="text-slate-500 font-mono text-[11px]">
          {new Date(app.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (app) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Inspect */}
          <button
            onClick={() => router.push(`/mentors/applications/${app.id}`)}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-colors"
            title="Inspect Application Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* If PENDING: Begin Review button */}
          {app.status === 'PENDING' && (
            <button
              onClick={() => handleStartReview(app.id)}
              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-sm transition-colors"
              title="Begin Review (Mark Under Review)"
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
          )}

          {/* If PENDING or UNDER_REVIEW: Approve */}
          {['PENDING', 'UNDER_REVIEW'].includes(app.status) && (
            <button
              onClick={() => {
                setSelectedApp(app);
                setApproveModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm transition-colors"
              title="Approve Application"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          )}

          {/* If APPROVED: Resend Welcome */}
          {app.status === 'APPROVED' && (
            <button
              onClick={() => {
                setSelectedApp(app);
                setResendModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-sm transition-colors"
              title="Resend Welcome Email"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* If PENDING or UNDER_REVIEW: Reject */}
          {['PENDING', 'UNDER_REVIEW'].includes(app.status) && (
            <button
              onClick={() => {
                setSelectedApp(app);
                setRejectModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-sm transition-colors"
              title="Reject Application"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Columns for Directory Mentors Tab
  const mentorColumns: Column<MentorListDTO>[] = [
    {
      key: 'name',
      header: 'Mentor',
      render: (m) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs text-blue-600 shrink-0 shadow-sm">
            {m.name.charAt(0)}
          </div>
          <div className="flex flex-col truncate">
            <span className="font-semibold text-slate-900 truncate">{m.name}</span>
            <span className="text-[11px] text-slate-500 truncate">{m.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'domain',
      header: 'Domain & Experience',
      render: (m) => (
        <div className="flex flex-col truncate">
          <span className="font-medium text-slate-700">{m.domain}</span>
          <span className="text-[11px] text-slate-500">{m.experienceYears} Years Exp</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (m) => <StatusBadge status={m.status} size="sm" />,
    },
    {
      key: 'startingPrice',
      header: 'Starting Fee',
      render: (m) => (
        <span className="text-slate-700 font-semibold text-xs font-mono">
          ₹{m.startingPrice.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'sessionCount',
      header: 'Activity',
      render: (m) => (
        <div className="flex flex-col text-[11px]">
          <span className="font-semibold text-slate-800">{m.sessionCount} Sessions</span>
          <span className="text-slate-500">Rating: {m.rating.toFixed(1)} ★</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (m) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => router.push(`/mentors/${m.id}`)}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-colors"
            title="Inspect Mentor Record"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell
      title="Mentor Applications & Management"
      subtitle="Review applicant credentials, verify domain expertise, and manage mentor authorizations"
    >
      <div className="space-y-4">
        {/* Success Banner */}
        {successBanner && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('applications');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'applications'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Mentor Applications ({appsData.total})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('directory');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'directory'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Approved Mentors ({mentorsData.total})</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <AdminSearch
            value={q}
            onChange={(val) => {
              setQ(val);
              setPage(1);
            }}
            placeholder={
              activeTab === 'applications'
                ? 'Search applications by name, email, or domain...'
                : 'Search mentors by name, email, or domain...'
            }
          />
          <AdminFilters
            filters={filterConfigs}
            onReset={handleResetFilters}
            hasActiveFilters={Boolean(q || domain !== 'All' || status !== 'All')}
          />
        </div>

        {/* Table Content */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          {activeTab === 'applications' ? (
            <>
              <AdminTable
                columns={applicationColumns}
                data={appsData.items}
                isLoading={isLoading}
                onRowClick={(app) => router.push(`/mentors/applications/${app.id}`)}
              />
              <AdminPagination
                currentPage={appsData.page}
                totalPages={appsData.totalPages}
                totalItems={appsData.total}
                pageSize={appsData.limit}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
              />
            </>
          ) : (
            <>
              <AdminTable
                columns={mentorColumns}
                data={mentorsData.items}
                isLoading={isLoading}
                onRowClick={(m) => router.push(`/mentors/${m.id}`)}
              />
              <AdminPagination
                currentPage={mentorsData.page}
                totalPages={mentorsData.totalPages}
                totalItems={mentorsData.total}
                pageSize={mentorsData.limit}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Quick Approve Dialog */}
      <ConfirmDialog
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={handleApprove}
        title="Approve Mentor Application"
        message={`Approve ${selectedApp?.fullName}? This will provision their mentor user account, elevate role to MENTOR, create their MentorProfile, and send a 24-hour setup link via ZeptoMail.`}
        confirmLabel="Approve & Send Welcome"
        variant="primary"
      />

      {/* Quick Reject Dialog */}
      <ConfirmDialog
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleReject}
        title="Reject Mentor Application"
        message={`Provide an auditable reason for rejecting ${selectedApp?.fullName}.`}
        confirmLabel="Reject Application"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Specify reason..."
      />

      {/* Resend Welcome Dialog */}
      <ConfirmDialog
        isOpen={resendModalOpen}
        onClose={() => setResendModalOpen(false)}
        onConfirm={handleResendWelcome}
        title="Resend Welcome Email"
        message={`Invalidate previous setup links and send a new 24-hour activation link to ${selectedApp?.email}?`}
        confirmLabel="Resend Email"
        variant="primary"
      />
    </AdminShell>
  );
}
