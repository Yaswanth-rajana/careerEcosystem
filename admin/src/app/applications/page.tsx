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
import { ApplicationAdminListDTO, ApplicationAdminDetailDTO, PaginatedAdminResult } from '@backend/types/admin';
import { Eye, FileCheck2, User, Briefcase, Calendar } from 'lucide-react';

export default function AdminApplicationsPage() {
  const [data, setData] = useState<PaginatedAdminResult<ApplicationAdminListDTO>>({
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

  // Inspector modal
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [appDetail, setAppDetail] = useState<ApplicationAdminDetailDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(q.trim() ? { q: q.trim() } : {}),
        ...(status !== 'All' ? { status } : {}),
      });

      const res = await fetchAdminApi<PaginatedAdminResult<ApplicationAdminListDTO>>(
        `/api/admin/applications?${params.toString()}`
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
      const res = await fetchAdminApi<{ application: ApplicationAdminDetailDTO }>(
        `/api/admin/applications/${appId}`
      );
      setAppDetail(res.application);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
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
        { label: 'Applied', value: 'APPLIED' },
        { label: 'Under Review', value: 'UNDER_REVIEW' },
        { label: 'Shortlisted', value: 'SHORTLISTED' },
        { label: 'Task Pending', value: 'TASK_PENDING' },
        { label: 'Task Submitted', value: 'TASK_SUBMITTED' },
        { label: 'Interview', value: 'INTERVIEW' },
        { label: 'Offer', value: 'OFFER' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Withdrawn', value: 'WITHDRAWN' },
      ],
    },
  ];

  const handleResetFilters = () => {
    setQ('');
    setStatus('All');
    setPage(1);
  };

  const columns: Column<ApplicationAdminListDTO>[] = [
    {
      key: 'candidateName',
      header: 'Candidate',
      render: (a) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs text-blue-600 shrink-0 shadow-sm">
            {a.candidateName.charAt(0)}
          </div>
          <div className="flex flex-col truncate">
            <span className="font-semibold text-slate-900 truncate">{a.candidateName}</span>
            <span className="text-[11px] text-slate-500 truncate">{a.candidateEmail}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'jobTitle',
      header: 'Applied Position',
      render: (a) => (
        <div className="flex flex-col truncate">
          <span className="font-semibold text-slate-800 truncate">{a.jobTitle}</span>
          <span className="text-[11px] text-slate-500 truncate">{a.company}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => <StatusBadge status={a.status} size="sm" />,
    },
    {
      key: 'appliedAt',
      header: 'Submission Date',
      render: (a) => (
        <span className="text-slate-500 font-mono text-[11px]">
          {new Date(a.appliedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (a) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleInspect(a.id);
          }}
          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-colors"
          title="Inspect Application"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <AdminShell
      title="Candidate Job Applications"
      subtitle="Track application stages across employers, inspect submission notes, and monitor pipeline metrics"
    >
      <div className="space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <AdminSearch
            value={q}
            onChange={(val) => {
              setQ(val);
              setPage(1);
            }}
            placeholder="Search by candidate name or position..."
          />
          <AdminFilters
            filters={filterConfigs}
            onReset={handleResetFilters}
            hasActiveFilters={Boolean(q || status !== 'All')}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <AdminTable
            columns={columns}
            data={data.items}
            isLoading={isLoading}
            onRowClick={(a) => handleInspect(a.id)}
          />
          <AdminPagination
            currentPage={data.page}
            totalPages={data.totalPages}
            totalItems={data.total}
            pageSize={data.limit}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Application Detail Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Application Details"
        subtitle={appDetail ? `${appDetail.jobTitle} at ${appDetail.company}` : undefined}
        maxWidth="lg"
      >
        {detailLoading || !appDetail ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            LOADING APPLICATION DETAILS...
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Candidate</span>
                <StatusBadge status={appDetail.status} size="sm" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs text-blue-600 shadow-sm">
                  {appDetail.candidateName.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{appDetail.candidateName}</span>
                  <span className="text-slate-500 text-xs">{appDetail.candidateEmail}</span>
                </div>
              </div>
            </div>

            {appDetail.coverNote ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-slate-500 font-semibold uppercase text-[10px] block">
                  Candidate Note / Pitch
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {appDetail.coverNote}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 italic">
                No custom cover note provided by candidate.
              </div>
            )}

            {appDetail.feedback && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="text-blue-700 font-semibold uppercase text-[10px] block">
                  Recruiter Feedback
                </span>
                <p className="text-slate-800 leading-relaxed">{appDetail.feedback}</p>
              </div>
            )}

            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>Applied: {new Date(appDetail.appliedAt).toLocaleString()}</span>
              {appDetail.reviewedAt && (
                <span>Reviewed: {new Date(appDetail.reviewedAt).toLocaleString()}</span>
              )}
            </div>
          </div>
        )}
      </AdminModal>
    </AdminShell>
  );
}
