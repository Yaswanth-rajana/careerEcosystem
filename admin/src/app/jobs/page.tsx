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
import { JobAdminListDTO, PaginatedAdminResult } from '@backend/types/admin';
import { Briefcase, CheckCircle, ShieldCheck, Eye, Sparkles } from 'lucide-react';

export default function AdminJobsPage() {
  const router = useRouter();

  const [data, setData] = useState<PaginatedAdminResult<JobAdminListDTO>>({
    items: [],
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [workMode, setWorkMode] = useState('All');
  const [employmentType, setEmploymentType] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Quick Action Dialog
  const [selectedJob, setSelectedJob] = useState<JobAdminListDTO | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(q.trim() ? { q: q.trim() } : {}),
        ...(status !== 'All' ? { status } : {}),
        ...(workMode !== 'All' ? { workMode } : {}),
        ...(employmentType !== 'All' ? { employmentType } : {}),
      });

      const res = await fetchAdminApi<PaginatedAdminResult<JobAdminListDTO>>(
        `/api/admin/jobs?${params.toString()}`
      );
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, q, status, workMode, employmentType]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handlePublishJob = async () => {
    if (!selectedJob) return;
    await fetchAdminApi(`/api/admin/jobs/${selectedJob.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'PUBLISHED', jobVerified: true }),
    });
    fetchJobs();
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
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Pending Review', value: 'PENDING_REVIEW' },
        { label: 'Paused', value: 'PAUSED' },
        { label: 'Closed', value: 'CLOSED' },
        { label: 'Archived', value: 'ARCHIVED' },
      ],
    },
    {
      key: 'workMode',
      label: 'Work Mode',
      value: workMode,
      onChange: (val) => {
        setWorkMode(val);
        setPage(1);
      },
      options: [
        { label: 'Remote', value: 'Remote' },
        { label: 'Hybrid', value: 'Hybrid' },
        { label: 'On-site', value: 'On-site' },
      ],
    },
  ];

  const handleResetFilters = () => {
    setQ('');
    setStatus('All');
    setWorkMode('All');
    setEmploymentType('All');
    setPage(1);
  };

  const columns: Column<JobAdminListDTO>[] = [
    {
      key: 'title',
      header: 'Job Title & Employer',
      render: (j) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs text-blue-600 shrink-0 shadow-sm">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="flex flex-col truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 truncate">{j.title}</span>
              {j.jobVerified && (
                <span title="Verified Posting">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </span>
              )}
              {j.featured && (
                <span title="Featured">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 truncate">
              {j.company} · {j.location} ({j.workMode})
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'employmentType',
      header: 'Type & Level',
      render: (j) => (
        <div className="flex flex-col text-xs">
          <span className="text-slate-700 font-medium">{j.employmentType}</span>
          <span className="text-[11px] text-slate-500">{j.experienceLevel}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Moderation Status',
      render: (j) => <StatusBadge status={j.status} size="sm" />,
    },
    {
      key: 'applicationsCount',
      header: 'Applications',
      render: (j) => (
        <span className="font-mono text-xs text-slate-700 font-semibold">
          {j.applicationsCount}
        </span>
      ),
    },
    {
      key: 'publishedAt',
      header: 'Posted Date',
      render: (j) => (
        <span className="text-slate-500 font-mono text-[11px]">
          {j.publishedAt ? new Date(j.publishedAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (j) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => router.push(`/jobs/${j.id}`)}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-colors"
            title="Inspect & Moderate Job"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {j.status !== 'PUBLISHED' && (
            <button
              onClick={() => {
                setSelectedJob(j);
                setPublishModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm transition-colors"
              title="Publish Job Live"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminShell
      title="Job Listings & Moderation"
      subtitle="Verify employer postings, moderate compensation terms, and manage listing lifecycles"
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
            placeholder="Search jobs by title, company, or location..."
          />
          <AdminFilters
            filters={filterConfigs}
            onReset={handleResetFilters}
            hasActiveFilters={Boolean(q || status !== 'All' || workMode !== 'All')}
          />
        </div>

        {/* Jobs Table */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <AdminTable
            columns={columns}
            data={data.items}
            isLoading={isLoading}
            onRowClick={(j) => router.push(`/jobs/${j.id}`)}
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

      {/* Publish Dialog */}
      <ConfirmDialog
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={handlePublishJob}
        title="Approve & Publish Job Listing"
        message={`Approve and publish "${selectedJob?.title}" at "${selectedJob?.company}" to candidate job board?`}
        confirmLabel="Publish Job"
        variant="primary"
      />
    </AdminShell>
  );
}
