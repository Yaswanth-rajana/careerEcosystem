'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminShell } from '@/components/AdminShell';
import { AdminTable, Column } from '@/components/AdminTable';
import { AdminPagination } from '@/components/AdminPagination';
import { AdminSearch } from '@/components/AdminSearch';
import { AdminFilters, FilterConfig } from '@/components/AdminFilters';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { fetchAdminApi } from '@/lib/apiHelper';
import { CourseListDTO, PaginatedAdminResult } from '@backend/types/admin';
import { PlusCircle, Edit3, CheckCircle, Archive, Clock, BookOpen } from 'lucide-react';

export default function AdminCoursesPage() {
  const router = useRouter();

  const [data, setData] = useState<PaginatedAdminResult<CourseListDTO>>({
    items: [],
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modals for actions
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(q.trim() ? { q: q.trim() } : {}),
        ...(category !== 'All' ? { category } : {}),
        ...(level !== 'All' ? { level } : {}),
        ...(status !== 'All' ? { status } : {}),
      });

      const res = await fetchAdminApi<PaginatedAdminResult<CourseListDTO>>(
        `/api/admin/courses?${params.toString()}`
      );
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, q, category, level, status]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handlePublish = async () => {
    if (!selectedCourseId) return;
    await fetchAdminApi(`/api/admin/courses/${selectedCourseId}/publish`, {
      method: 'POST',
    });
    fetchCourses();
  };

  const handleArchive = async () => {
    if (!selectedCourseId) return;
    await fetchAdminApi(`/api/admin/courses/${selectedCourseId}/archive`, {
      method: 'POST',
    });
    fetchCourses();
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
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Review', value: 'REVIEW' },
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Paused', value: 'PAUSED' },
        { label: 'Archived', value: 'ARCHIVED' },
      ],
    },
    {
      key: 'level',
      label: 'Level',
      value: level,
      onChange: (val) => {
        setLevel(val);
        setPage(1);
      },
      options: [
        { label: 'Beginner', value: 'BEGINNER' },
        { label: 'Intermediate', value: 'INTERMEDIATE' },
        { label: 'Advanced', value: 'ADVANCED' },
      ],
    },
    {
      key: 'category',
      label: 'Category',
      value: category,
      onChange: (val) => {
        setCategory(val);
        setPage(1);
      },
      options: [
        { label: 'Software Engineering', value: 'Software Engineering' },
        { label: 'AI / Data Science', value: 'AI / Data Science' },
        { label: 'Design', value: 'Design' },
        { label: 'Product', value: 'Product' },
      ],
    },
  ];

  const handleResetFilters = () => {
    setQ('');
    setCategory('All');
    setLevel('All');
    setStatus('All');
    setPage(1);
  };

  const columns: Column<CourseListDTO>[] = [
    {
      key: 'title',
      header: 'Course Curriculum',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs text-blue-600 shrink-0 shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex flex-col truncate">
            <span className="font-semibold text-slate-900 truncate">{c.title}</span>
            <span className="text-[11px] text-slate-500 truncate">
              {c.category} · {c.level} · {c.durationHours}h · {c.lessonsCount} lessons
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'instructorName',
      header: 'Instructor',
      render: (c) => <span className="text-slate-700 font-medium">{c.instructorName}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <StatusBadge status={c.status} size="sm" />,
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      render: (c) => (
        <span className="text-slate-500 font-mono text-[11px]">
          {new Date(c.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (c) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/courses/${c.id}`}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-colors"
            title="Edit Course"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </Link>

          {c.status !== 'PUBLISHED' && c.status !== 'ARCHIVED' && (
            <button
              onClick={() => {
                setSelectedCourseId(c.id);
                setPublishModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm transition-colors"
              title="Publish Course"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          )}

          {c.status !== 'ARCHIVED' && (
            <button
              onClick={() => {
                setSelectedCourseId(c.id);
                setArchiveModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 shadow-sm transition-colors"
              title="Archive Course"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminShell
      title="Courses & Curriculum Management"
      subtitle="Manage course structures, learning objectives, modules, and publish workflows"
      actions={
        <Link
          href="/courses/new"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Create Course</span>
        </Link>
      }
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
            placeholder="Search courses by title or instructor..."
          />
          <AdminFilters
            filters={filterConfigs}
            onReset={handleResetFilters}
            hasActiveFilters={Boolean(q || category !== 'All' || level !== 'All' || status !== 'All')}
          />
        </div>

        {/* Courses Table */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <AdminTable
            columns={columns}
            data={data.items}
            isLoading={isLoading}
            onRowClick={(c) => router.push(`/courses/${c.id}`)}
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
        onConfirm={handlePublish}
        title="Publish Course to Catalog"
        message="Publishing this course will make it immediately visible to all candidates across PATHWAY.ECO. The system will verify that all required learning objectives, modules, and lessons are complete."
        confirmLabel="Publish Course"
        variant="primary"
      />

      {/* Archive Dialog */}
      <ConfirmDialog
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        onConfirm={handleArchive}
        title="Archive Course"
        message="Archiving will hide the course from candidates while preserving all historical enrollment records."
        confirmLabel="Archive Course"
        variant="danger"
      />
    </AdminShell>
  );
}
