'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { AdminTable, Column } from '@/components/AdminTable';
import { AdminPagination } from '@/components/AdminPagination';
import { AdminSearch } from '@/components/AdminSearch';
import { AdminFilters, FilterConfig } from '@/components/AdminFilters';
import { AdminModal } from '@/components/AdminModal';
import { fetchAdminApi } from '@/lib/apiHelper';
import { AuditLogDTO, PaginatedAdminResult } from '@backend/types/admin';
import { Eye, Terminal } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [data, setData] = useState<PaginatedAdminResult<AuditLogDTO>>({
    items: [],
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState('');
  const [action, setAction] = useState('All');
  const [resourceType, setResourceType] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Inspector modal
  const [selectedLog, setSelectedLog] = useState<AuditLogDTO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(q.trim() ? { q: q.trim() } : {}),
        ...(action !== 'All' ? { action } : {}),
        ...(resourceType !== 'All' ? { resourceType } : {}),
      });

      const res = await fetchAdminApi<PaginatedAdminResult<AuditLogDTO>>(
        `/api/admin/audit-logs?${params.toString()}`
      );
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, q, action, resourceType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filterConfigs: FilterConfig[] = [
    {
      key: 'resourceType',
      label: 'Resource',
      value: resourceType,
      onChange: (val) => {
        setResourceType(val);
        setPage(1);
      },
      options: [
        { label: 'Courses', value: 'COURSE' },
        { label: 'Mentors', value: 'MENTOR' },
        { label: 'Jobs', value: 'JOB' },
        { label: 'Users', value: 'USER' },
        { label: 'System', value: 'SYSTEM' },
      ],
    },
  ];

  const handleResetFilters = () => {
    setQ('');
    setAction('All');
    setResourceType('All');
    setPage(1);
  };

  const columns: Column<AuditLogDTO>[] = [
    {
      key: 'action',
      header: 'Audit Action',
      render: (log) => (
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
          <span className="font-mono font-semibold text-xs text-slate-900">
            {log.action}
          </span>
        </div>
      ),
    },
    {
      key: 'actorName',
      header: 'Actor',
      render: (log) => (
        <div className="flex flex-col truncate">
          <span className="font-semibold text-slate-800">{log.actorName}</span>
          <span className="text-[11px] text-slate-500 font-mono truncate">{log.actorEmail}</span>
        </div>
      ),
    },
    {
      key: 'resourceType',
      header: 'Resource Target',
      render: (log) => (
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-bold">
            {log.resourceType}
          </span>
          <span className="text-slate-400 truncate max-w-[120px]">{log.resourceId}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (log) => (
        <span className="text-slate-500 font-mono text-[11px]">
          {new Date(log.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Payload',
      className: 'text-right',
      render: (log) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(log);
            setModalOpen(true);
          }}
          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-colors"
          title="Inspect Audit Metadata"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <AdminShell
      title="System Audit Logs"
      subtitle="Immutable cryptographic-ready log of administrative operations, moderation changes, and role actions"
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
            placeholder="Search audit trail by actor, action, or ID..."
          />
          <AdminFilters
            filters={filterConfigs}
            onReset={handleResetFilters}
            hasActiveFilters={Boolean(q || action !== 'All' || resourceType !== 'All')}
          />
        </div>

        {/* Audit Table */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <AdminTable
            columns={columns}
            data={data.items}
            isLoading={isLoading}
            onRowClick={(log) => {
              setSelectedLog(log);
              setModalOpen(true);
            }}
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

      {/* Audit Log Inspector Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Audit Event Details"
        subtitle={selectedLog ? `Action: ${selectedLog.action}` : undefined}
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block uppercase">Actor:</span>
                <span className="text-slate-900 font-bold">{selectedLog.actorName}</span>
                <span className="text-slate-500 block">{selectedLog.actorEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase">Timestamp:</span>
                <span className="text-slate-700">
                  {new Date(selectedLog.createdAt).toISOString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase">Target:</span>
                <span className="text-blue-700 font-bold">{selectedLog.resourceType}</span>
                <span className="text-slate-500 block truncate">{selectedLog.resourceId}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase">Actor ID:</span>
                <span className="text-slate-500 truncate block">{selectedLog.actorId}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-500 font-semibold uppercase text-[10px] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>Sanitized Payload Metadata</span>
              </span>
              <pre className="p-4 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 font-mono text-[11px] overflow-x-auto max-h-64 shadow-inner">
                {selectedLog.details
                  ? JSON.stringify(selectedLog.details, null, 2)
                  : 'No extra metadata payload.'}
              </pre>
            </div>
          </div>
        )}
      </AdminModal>
    </AdminShell>
  );
}
