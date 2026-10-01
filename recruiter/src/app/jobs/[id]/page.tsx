'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Users,
  Copy,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Trash2,
} from 'lucide-react';
import { RecruiterShell } from '@/components/RecruiterShell';
import { StatusBadge } from '@/components/StatusBadge';
import { RecruiterJobDetailDTO } from '@backend/types/recruiter';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [job, setJob] = useState<RecruiterJobDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit fields
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('REMOTE');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [experienceLevel, setExperienceLevel] = useState('MID');
  const [status, setStatus] = useState<any>('DRAFT');
  const [salaryMin, setSalaryMin] = useState<number | ''>('');
  const [salaryMax, setSalaryMax] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (jobId) fetchJob();
  }, [jobId]);

  async function fetchJob() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/recruiter/jobs/${jobId}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load job');
      }
      const data: RecruiterJobDetailDTO = json.data;
      setJob(data);
      setTitle(data.title);
      setLocation(data.location);
      setWorkMode(data.workMode);
      setEmploymentType(data.employmentType);
      setExperienceLevel(data.experienceLevel);
      setStatus(data.status);
      setSalaryMin(data.salaryMin || '');
      setSalaryMax(data.salaryMax || '');
      setDescription(data.description);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/recruiter/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          location,
          workMode,
          employmentType,
          experienceLevel,
          status,
          salaryMin: salaryMin ? Number(salaryMin) : undefined,
          salaryMax: salaryMax ? Number(salaryMax) : undefined,
          description,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update job');
      }
      setJob(json.data);
      setSuccess('Job updated successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicate() {
    if (!confirm('Duplicate this job posting?')) return;
    try {
      const res = await fetch(`/api/recruiter/jobs/${jobId}/duplicate`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to duplicate');
      router.push(`/jobs/${json.data.id}`);
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <RecruiterShell
      title={job ? job.title : 'Job Posting'}
      subtitle={job ? `Requisition ID: ${job.id}` : ''}
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/applications?jobId=${jobId}`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Users className="h-3.5 w-3.5 text-slate-500" />
              View Pipeline ({job?.applicationsCount || 0})
            </Link>
            <button
              type="button"
              onClick={handleDuplicate}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <Copy className="h-3.5 w-3.5 text-slate-500" />
              Duplicate
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading job details...</div>
        ) : !job ? (
          <div className="p-12 text-center text-slate-400 text-xs">Job not found.</div>
        ) : (
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Created on {new Date(job.createdAt).toLocaleDateString()} • {job.applicationsCount} applicants
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Job Configuration
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Role Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Work Mode</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="0-1 years">0-1 years</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Salary Min</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : '')}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Salary Max</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : '')}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Role Description</label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Required Skills</label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {job.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-700 transition"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RecruiterShell>
  );
}
