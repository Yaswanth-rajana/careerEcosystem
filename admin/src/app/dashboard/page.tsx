'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/AdminShell';
import { StatCard } from '@/components/StatCard';
import { CardSkeleton } from '@/components/AdminSkeleton';
import { fetchAdminApi } from '@/lib/apiHelper';
import { AdminDashboardDTO } from '@backend/types/admin';
import {
  Users,
  GraduationCap,
  Briefcase,
  Compass,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchAdminApi<AdminDashboardDTO>('/api/admin/dashboard');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <AdminShell
      title="Platform Operations Dashboard"
      subtitle="Real-time ecosystem metrics, pending moderation queues, and operational controls"
    >
      <div className="space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. Overview KPIs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ecosystem Overview
            </h2>
            <span className="text-[11px] text-slate-400 font-mono font-medium">
              REAL-TIME DATABASE METRICS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading || !data ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  title="Students & Users"
                  value={data.metrics.students.total}
                  subtext={`${data.metrics.students.active} active accounts · ${data.metrics.students.newThisWeek} this week`}
                  icon={Users}
                />
                <StatCard
                  title="Approved Mentors"
                  value={data.metrics.mentors.active}
                  subtext={`${data.metrics.mentors.total} total registered in pool`}
                  icon={Compass}
                  badge={
                    data.metrics.mentors.pending > 0
                      ? { text: `${data.metrics.mentors.pending} Pending`, variant: 'warning' }
                      : undefined
                  }
                />
                <StatCard
                  title="Published Courses"
                  value={data.metrics.courses.published}
                  subtext={`${data.metrics.courses.draft} drafts under curriculum review`}
                  icon={GraduationCap}
                />
                <StatCard
                  title="Active Job Postings"
                  value={data.metrics.jobs.published}
                  subtext={`${data.metrics.applications.total} total candidate applications`}
                  icon={Briefcase}
                  badge={
                    data.metrics.jobs.pendingReview > 0
                      ? { text: `${data.metrics.jobs.pendingReview} In Review`, variant: 'warning' }
                      : undefined
                  }
                />
              </>
            )}
          </div>
        </div>

        {/* 2. Requires Attention Section */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Requires Administrator Attention</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mentor Approvals Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Mentor Applications
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {data?.pendingApprovals.mentorApplications ?? 0} Awaiting
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Qualified industry professionals awaiting profile verification, domain expertise review, and status approval.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  href="/mentors?status=PENDING"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                >
                  <span>Review Applications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Job Moderation Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Job Listings Moderation
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {data?.pendingApprovals.jobReviews ?? 0} Draft / Pending
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Company postings requiring employer verification, compensation clarity, and role validation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  href="/jobs?status=DRAFT"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                >
                  <span>Moderate Job Postings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Course Drafts Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Curriculum & Course Drafts
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {data?.pendingApprovals.courseReviews ?? 0} In Progress
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Courses currently in preparation or review. Verify learning objectives and module lessons before publishing.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  href="/courses?status=DRAFT"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                >
                  <span>Inspect Curriculum</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
