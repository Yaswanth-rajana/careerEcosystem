'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Award,
  FileText,
  ExternalLink,
  GraduationCap,
  Briefcase,
  FolderGit2,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { RecruiterShell } from '@/components/RecruiterShell';
import { StatusBadge } from '@/components/StatusBadge';
import { RecruiterApplicationDetailDTO } from '@backend/types/recruiter';

export default function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = params?.id as string;

  const [app, setApp] = useState<RecruiterApplicationDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Recruiter feedback
  const [feedback, setFeedback] = useState('');

  // Interview modal
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewTitle, setInterviewTitle] = useState('Technical Screening');
  const [interviewType, setInterviewType] = useState('TECHNICAL');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewDuration, setInterviewDuration] = useState(45);
  const [meetingUrl, setMeetingUrl] = useState('');

  // Offer modal
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerSalary, setOfferSalary] = useState<number | ''>(1200000);
  const [offerCurrency, setOfferCurrency] = useState('INR');
  const [offerStartDate, setOfferStartDate] = useState('');

  useEffect(() => {
    if (applicationId) fetchApplication();
  }, [applicationId]);

  async function fetchApplication() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/recruiter/applications/${applicationId}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load application');
      }
      setApp(json.data);
      setFeedback(json.data.feedback || '');
      setOfferTitle(json.data.jobTitle);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/recruiter/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, feedback }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update application');
      }
      setSuccess(`Application transitioned to ${newStatus.replace('_', ' ')}`);
      fetchApplication();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleScheduleInterview(e: React.FormEvent) {
    e.preventDefault();
    if (!app || !interviewDate) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/recruiter/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: app.jobId,
          applicationId: app.id,
          candidateId: app.candidate.id,
          title: interviewTitle,
          type: interviewType,
          scheduledAt: new Date(interviewDate).toISOString(),
          durationMinutes: Number(interviewDuration),
          meetingUrl: meetingUrl.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to schedule');
      setShowInterviewModal(false);
      setSuccess('Interview scheduled successfully');
      fetchApplication();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleCreateOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!app) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/recruiter/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: app.jobId,
          applicationId: app.id,
          candidateId: app.candidate.id,
          positionTitle: offerTitle,
          salaryOffered: Number(offerSalary),
          currency: offerCurrency,
          salaryPeriod: 'YEAR',
          startDate: offerStartDate ? new Date(offerStartDate).toISOString() : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to extend offer');
      setShowOfferModal(false);
      setSuccess('Offer extended successfully');
      fetchApplication();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <RecruiterShell
      title={app ? `${app.candidate.name} — Evaluation` : 'Candidate Review'}
      subtitle={app ? `Applied for: ${app.jobTitle}` : ''}
    >
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <Link
          href="/applications"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pipeline
        </Link>

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
          <div className="p-12 text-center text-slate-400 text-xs">Loading candidate profile...</div>
        ) : !app ? (
          <div className="p-12 text-center text-slate-400 text-xs">Application not found.</div>
        ) : (
          <div className="space-y-6">
            {/* Header Candidate Summary Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                  {app.candidate.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-slate-900">{app.candidate.name}</h2>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {app.candidate.headline || 'Candidate on PATHWAY.ECO'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {app.candidate.email} {app.candidate.location && `• ${app.candidate.location}`}
                  </p>
                </div>
              </div>

              {/* Resume download */}
              <div className="flex items-center gap-2">
                {app.resumeUrl ? (
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                  >
                    <FileText className="h-4 w-4" />
                    Open Resume
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">No resume attached</span>
                )}
              </div>
            </div>

            {/* Pipeline Stage Progression Controls */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Move Pipeline Stage
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={updating || app.status === 'UNDER_REVIEW'}
                  onClick={() => updateStatus('UNDER_REVIEW')}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Under Review
                </button>
                <button
                  type="button"
                  disabled={updating || app.status === 'SHORTLISTED'}
                  onClick={() => updateStatus('SHORTLISTED')}
                  className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
                >
                  Shortlist
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => setShowInterviewModal(true)}
                  className="rounded-lg bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                >
                  Schedule Interview
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => setShowOfferModal(true)}
                  className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Extend Job Offer
                </button>
                <button
                  type="button"
                  disabled={updating || app.status === 'REJECTED'}
                  onClick={() => updateStatus('REJECTED')}
                  className="rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-40"
                >
                  Reject
                </button>
              </div>
            </div>

            {/* Recruiter Internal Feedback Notes */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Internal Recruiter Notes & Evaluation
              </h3>
              <textarea
                rows={3}
                placeholder="Add confidential evaluation notes for your team (strengths, salary expectations, interview feedback)..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => updateStatus(app.status)}
                  className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
                >
                  Save Notes
                </button>
              </div>
            </div>

            {/* Candidate Profile Details (Education, Experience, Projects, Skills) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Skills & Proficiencies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {app.candidate.skills?.length ? (
                    app.candidate.skills.map((skill) => (
                      <span
                        key={skill.name}
                        className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                      >
                        {skill.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No verified skills listed</span>
                  )}
                </div>
              </div>

              {/* Assessment Submissions */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Platform Assessments
                </h4>
                {app.assessmentSubmissions?.length ? (
                  <div className="divide-y divide-slate-100">
                    {app.assessmentSubmissions.map((sub) => (
                      <div key={sub.id} className="py-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800">{sub.assessmentTitle}</span>
                        <span
                          className={`font-bold ${
                            sub.passed ? 'text-emerald-600' : 'text-slate-600'
                          }`}
                        >
                          Score: {sub.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No assessments submitted yet.</p>
                )}
              </div>

              {/* Experience Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Work Experience
                  </h4>
                </div>
                {app.candidate.experience?.length ? (
                  <div className="space-y-3">
                    {app.candidate.experience.map((exp) => (
                      <div key={exp.id} className="text-xs space-y-0.5 border-l-2 border-blue-200 pl-3">
                        <p className="font-semibold text-slate-900">{exp.roleTitle}</p>
                        <p className="text-slate-600">{exp.company}</p>
                        <p className="text-[11px] text-slate-400">
                          {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate || ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No experience records available.</p>
                )}
              </div>

              {/* Education Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Education
                  </h4>
                </div>
                {app.candidate.education?.length ? (
                  <div className="space-y-3">
                    {app.candidate.education.map((edu) => (
                      <div key={edu.id} className="text-xs space-y-0.5 border-l-2 border-purple-200 pl-3">
                        <p className="font-semibold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</p>
                        <p className="text-slate-600">{edu.institution}</p>
                        <p className="text-[11px] text-slate-400">{edu.startYear} - {edu.endYear || 'Present'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No education records available.</p>
                )}
              </div>
            </div>

            {/* Interviews Scheduled for this Application */}
            {app.interviews && app.interviews.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Scheduled Interviews ({app.interviews.length})
                </h4>
                <div className="divide-y divide-slate-100">
                  {app.interviews.map((inv) => (
                    <div key={inv.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{inv.title}</p>
                        <p className="text-slate-500">
                          {new Date(inv.scheduledAt).toLocaleString()} • {inv.durationMinutes} mins
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                          {inv.status}
                        </span>
                        {inv.meetingUrl && (
                          <a
                            href={inv.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            Meeting Link <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Schedule Interview Modal */}
        {showInterviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <h3 className="text-base font-semibold text-slate-900">Schedule Interview</h3>
              <form onSubmit={handleScheduleInterview} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700">Title</label>
                  <input
                    type="text"
                    required
                    value={interviewTitle}
                    onChange={(e) => setInterviewTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Type</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="SCREENING">Screening</option>
                    <option value="TECHNICAL">Technical Round</option>
                    <option value="BEHAVIORAL">Behavioral</option>
                    <option value="CULTURE_FIT">Culture Fit</option>
                    <option value="FINAL">Final Executive Round</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={interviewDuration}
                    onChange={(e) => setInterviewDuration(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Meeting URL (Google Meet / Zoom)</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowInterviewModal(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Confirm Interview
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Extend Offer Modal */}
        {showOfferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <h3 className="text-base font-semibold text-slate-900">Extend Formal Job Offer</h3>
              <form onSubmit={handleCreateOffer} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700">Position Title</label>
                  <input
                    type="text"
                    required
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Annual Salary</label>
                  <input
                    type="number"
                    required
                    value={offerSalary}
                    onChange={(e) => setOfferSalary(e.target.value ? Number(e.target.value) : '')}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Currency</label>
                  <select
                    value={offerCurrency}
                    onChange={(e) => setOfferCurrency(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={offerStartDate}
                    onChange={(e) => setOfferStartDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowOfferModal(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Send Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RecruiterShell>
  );
}
