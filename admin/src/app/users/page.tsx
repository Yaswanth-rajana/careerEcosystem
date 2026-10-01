'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { AdminTable, Column } from '@/components/AdminTable';
import { AdminPagination } from '@/components/AdminPagination';
import { AdminSearch } from '@/components/AdminSearch';
import { AdminFilters, FilterConfig } from '@/components/AdminFilters';
import { StatusBadge } from '@/components/StatusBadge';
import { fetchAdminApi } from '@/lib/apiHelper';
import { UserListDTO, PaginatedAdminResult } from '@backend/types/admin';
import { Eye, CheckCircle, Clock } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();

  const [data, setData] = useState<PaginatedAdminResult<UserListDTO>>({
    items: [],
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(q.trim() ? { q: q.trim() } : {}),
        ...(role !== 'All' ? { role } : {}),
        ...(status !== 'All' ? { status } : {}),
      });

      const res = await fetchAdminApi<PaginatedAdminResult<UserListDTO>>(
        `/api/admin/users?${params.toString()}`
      );
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, q, role, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filterConfigs: FilterConfig[] = [
    {
      key: 'role',
      label: 'Role',
      value: role,
      onChange: (val) => {
        setRole(val);
        setPage(1);
      },
      options: [
        { label: 'Candidate', value: 'CANDIDATE' },
        { label: 'Mentor', value: 'MENTOR' },
        { label: 'Recruiter', value: 'RECRUITER' },
        { label: 'Admin', value: 'ADMIN' },
        { label: 'Super Admin', value: 'SUPER_ADMIN' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      value: status,
      onChange: (val) => {
        setStatus(val);
        setPage(1);
      },
      options: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Suspended', value: 'SUSPENDED' },
        { label: 'Deactivated', value: 'DEACTIVATED' },
      ],
    },
  ];

  const handleResetFilters = () => {
    setQ('');
    setRole('All');
    setStatus('All');
    setPage(1);
  };

  const columns: Column<UserListDTO>[] = [
    {
      key: 'name',
      header: 'User / Candidate',
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs text-blue-600 shrink-0 shadow-sm">
            {u.name.charAt(0)}
          </div>
          <div className="flex flex-col truncate">
            <span className="font-semibold text-slate-900 truncate">{u.name}</span>
            <span className="text-[11px] text-slate-500 truncate">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => <StatusBadge status={u.role} size="sm" />,
    },
    {
      key: 'candidateType',
      header: 'Profile Type',
      render: (u) => (
        <span className="text-slate-700 font-medium">
          {u.candidateType || 'Student'}
        </span>
      ),
    },
    {
      key: 'isOnboarded',
      header: 'Onboarding',
      render: (u) => (
        <span className="inline-flex items-center gap-1.5 text-xs">
          {u.isOnboarded ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Completed
            </span>
          ) : (
            <span className="text-amber-700 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> In Progress
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (u) => <StatusBadge status={u.status} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (u) => (
        <span className="text-slate-500 font-mono text-[11px]">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (u) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/users/${u.id}`);
          }}
          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-colors"
          title="Inspect User Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <AdminShell
      title="User & Candidate Directory"
      subtitle="Inspect candidate profiles, onboarding progress, and manage account statuses"
    >
      <div className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <AdminSearch
            value={q}
            onChange={(val) => {
              setQ(val);
              setPage(1);
            }}
            placeholder="Search by name or email address..."
          />
          <AdminFilters
            filters={filterConfigs}
            onReset={handleResetFilters}
            hasActiveFilters={Boolean(q || role !== 'All' || status !== 'All')}
          />
        </div>

        {/* Table Container */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <AdminTable
            columns={columns}
            data={data.items}
            isLoading={isLoading}
            onRowClick={(u) => router.push(`/users/${u.id}`)}
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
    </AdminShell>
  );
}
