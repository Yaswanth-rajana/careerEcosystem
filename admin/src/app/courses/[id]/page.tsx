'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/AdminShell';
import { AdminBreadcrumbs } from '@/components/AdminBreadcrumbs';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { fetchAdminApi } from '@/lib/apiHelper';
import { CourseDetailDTO } from '@backend/types/admin';
import {
  BookOpen,
  CheckCircle,
  Archive,
  Layers,
  Clock,
  Video,
  Sparkles,
  User,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const [course, setCourse] = useState<CourseDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Dialogs
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);

  const fetchCourse = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchAdminApi<{ course: CourseDetailDTO }>(
        `/api/admin/courses/${params.id}`
      );
      setCourse(res.course);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch course details');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handlePublish = async () => {
    try {
      setError(null);
      await fetchAdminApi(`/api/admin/courses/${params.id}/publish`, {
        method: 'POST',
      });
      setActionSuccess('Course successfully published to candidate portal!');
      fetchCourse();
    } catch (err: any) {
      setError(err.message || 'Failed to publish course');
    }
  };

  const handleArchive = async () => {
    try {
      setError(null);
      await fetchAdminApi(`/api/admin/courses/${params.id}/archive`, {
        method: 'POST',
      });
      setActionSuccess('Course successfully archived.');
      fetchCourse();
    } catch (err: any) {
      setError(err.message || 'Failed to archive course');
    }
  };

  if (isLoading) {
    return (
      <AdminShell title="Course Curriculum Inspection">
        <div className="p-12 text-center text-xs text-slate-500 font-mono">
          LOADING CURRICULUM DATA...
        </div>
      </AdminShell>
    );
  }

  if (error || !course) {
    return (
      <AdminShell title="Course Curriculum Inspection">
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs shadow-sm">
          {error || 'Course not found'}
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Course Curriculum & Publishing">
      <AdminBreadcrumbs
        items={[
          { label: 'Courses', href: '/courses' },
          { label: course.title },
        ]}
      />

      <div className="space-y-6">
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">{actionSuccess}</span>
            </div>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header Overview Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-1 shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 font-display tracking-tight">{course.title}</h2>
                <StatusBadge status={course.status} size="md" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {course.category} · {course.level} · {course.durationHours} Hours ·{' '}
                {course.lessonsCount} Lessons
              </p>
              {course.publishedAt && (
                <p className="text-[11px] text-emerald-700 font-mono mt-1 font-semibold">
                  Published on {new Date(course.publishedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {course.status !== 'PUBLISHED' && course.status !== 'ARCHIVED' && (
              <button
                onClick={() => setPublishModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Publish Course</span>
              </button>
            )}

            {course.status !== 'ARCHIVED' && (
              <button
                onClick={() => setArchiveModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive Course</span>
              </button>
            )}
          </div>
        </div>

        {/* Course Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metadata Sidebar (1 col) */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Instructor</span>
              </h3>
              <div className="text-xs">
                <span className="font-bold text-slate-900 text-sm block">{course.instructorName}</span>
                {course.instructorTitle && (
                  <span className="text-slate-500 block mt-0.5">{course.instructorTitle}</span>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Target Skills</span>
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {course.skills.map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Learning Objectives
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                {course.learningObjectives.map((obj, i) => (
                  <li key={i} className="leading-relaxed">
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Curriculum Structure (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Curriculum Hierarchy ({course.modules.length} Modules)</span>
              </h3>
            </div>

            <div className="space-y-4">
              {course.modules.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  No modules defined yet.
                </div>
              ) : (
                course.modules.map((m, mIdx) => (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] font-mono text-blue-600 uppercase tracking-wider font-semibold">
                          Module {mIdx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{m.title}</h4>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        {m.lessons.length} {m.lessons.length === 1 ? 'Lesson' : 'Lessons'}
                      </span>
                    </div>

                    {m.description && (
                      <p className="text-xs text-slate-500">{m.description}</p>
                    )}

                    <div className="divide-y divide-slate-100 pt-2 border-t border-slate-100">
                      {m.lessons.map((les, lIdx) => (
                        <div
                          key={les.id}
                          className="py-2.5 first:pt-2 last:pb-1 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-slate-400 font-mono text-[11px]">
                              {mIdx + 1}.{lIdx + 1}
                            </span>
                            {les.type === 'VIDEO' ? (
                              <Video className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span className="text-slate-800 font-medium">{les.title}</span>
                          </div>

                          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
                            <span>{les.durationMin} mins</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] text-slate-600 font-medium">
                              {les.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Publish Dialog */}
      <ConfirmDialog
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={handlePublish}
        title="Publish Course to Candidate Catalog"
        message="This action publishes the course live to PATHWAY.ECO. The backend CoursePublishingService will verify that learning objectives, modules, and lessons are present."
        confirmLabel="Publish Course"
        variant="primary"
      />

      {/* Archive Dialog */}
      <ConfirmDialog
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        onConfirm={handleArchive}
        title="Archive Course"
        message="Archiving hides the course from candidate browsing while preserving all module structures and historical data."
        confirmLabel="Archive Course"
        variant="danger"
      />
    </AdminShell>
  );
}
