'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
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
  Building2,
  Globe,
  RefreshCw,
  Lock,
  Sparkles,
  Download,
  ChevronDown,
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
      setError(err.message || 'An error occurred loading the application.');
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
      setSuccess(`Application successfully updated.`);
      fetchApplication();
    } catch (err: any) {
      setError(err.message || 'Failed to update application status.');
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
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchApplication}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-800 underline hover:no-underline"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span>Loading verified candidate application details...</span>
          </div>
        ) : !app ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 text-xs">
            Application not found or you do not have permission to access it.
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Header Candidate Summary Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start sm:items-center gap-4">
                {app.candidate.avatarUrl ? (
                  <img
                    src={app.candidate.avatarUrl}
                    alt={app.candidate.name}
                    className="h-16 w-16 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                    {app.candidate.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-lg font-bold text-slate-900">{app.candidate.name}</h2>
                    <StatusBadge status={app.status} />
                    {app.candidate.candidateType && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                        {app.candidate.candidateType}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-600">
                    {app.candidate.headline || 'Candidate on PATHWAY.ECO'}
                  </p>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 pt-0.5">
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {app.candidate.email}
                    </span>
                    {app.candidate.phone && (
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {app.candidate.phone}
                      </span>
                    )}
                    {app.candidate.location && (
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {app.candidate.location}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Applied: <strong className="font-semibold text-slate-700">{app.jobTitle}</strong>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Submitted: {new Date(app.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resume download / preview */}
              <div className="flex flex-col items-start md:items-end gap-2 self-start md:self-center shrink-0">
                {app.hasResume || app.resumeUrl ? (
                  <>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/recruiter/applications/${app.id}/resume`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-xs"
                      >
                        <FileText className="h-4 w-4" />
                        <span>View Resume</span>
                      </a>
                      <a
                        href={`/api/recruiter/applications/${app.id}/resume`}
                        download={app.resumeFilename || 'resume.pdf'}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                      >
                        <Download className="h-3.5 w-3.5 text-slate-500" />
                        <span>Download</span>
                      </a>
                    </div>
                    {app.resumeFilename && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700 max-w-[180px] truncate">
                          {app.resumeFilename}
                        </span>
                        {app.resumeFileSize && (
                          <span className="text-[10px] text-slate-400">
                            ({(app.resumeFileSize / (1024 * 1024)).toFixed(1)} MB)
                          </span>
                        )}
                        {app.resumeFileType && (
                          <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {app.resumeFileType.includes('pdf') ? 'PDF' : app.resumeFileType.includes('word') || app.resumeFileType.includes('docx') ? 'DOCX' : 'TXT'}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-slate-400 italic bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                    No resume submitted
                  </span>
                )}
              </div>
            </div>

            {/* 2. Pipeline Stage Progression Controls */}
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

            {/* 3. Recruiter Internal Feedback Notes (Confidential) */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Internal Recruiter Notes & Evaluation
                  </h3>
                </div>
                <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                  Confidential — never shared with candidate
                </span>
              </div>
              <textarea
                rows={3}
                placeholder="Add confidential evaluation notes for your hiring team (strengths, salary expectations, interview feedback)..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => updateStatus(app.status)}
                  className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>

            {/* 4. Candidate Cover Note (if provided) */}
            {app.coverNote && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Candidate Cover Note
                </h4>
                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  {app.coverNote}
                </p>
              </div>
            )}

            {/* 5. Professional Summary / Bio (if provided) */}
            {app.candidate.bio && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Professional Summary
                </h4>
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {app.candidate.bio}
                </p>
              </div>
            )}

            {/* 6. Candidate Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Work Experience */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Work Experience
                  </h4>
                </div>
                {app.candidate.experience?.length ? (
                  <div className="space-y-4">
                    {app.candidate.experience.map((exp) => (
                      <div key={exp.id} className="text-xs space-y-1 border-l-2 border-blue-200 pl-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900">{exp.roleTitle}</p>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate || ''}
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium">
                          {exp.company}
                          {exp.employmentType && ` • ${exp.employmentType}`}
                          {exp.location && ` • ${exp.location}`}
                        </p>
                        {(exp.responsibilities || exp.description) && (
                          <p className="text-[11px] text-slate-500 whitespace-pre-wrap pt-0.5 leading-relaxed">
                            {exp.responsibilities || exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No experience records available.</p>
                )}
              </div>

              {/* Education */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Education
                  </h4>
                </div>
                {app.candidate.education?.length ? (
                  <div className="space-y-4">
                    {app.candidate.education.map((edu) => (
                      <div key={edu.id} className="text-xs space-y-1 border-l-2 border-purple-200 pl-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900">
                            {edu.degree} in {edu.fieldOfStudy}
                          </p>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {edu.startYear} - {edu.isCurrent ? 'Present' : edu.endYear || ''}
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium">
                          {edu.institution}
                          {edu.location && ` • ${edu.location}`}
                        </p>
                        {edu.gpa && (
                          <p className="text-[11px] font-semibold text-emerald-700">
                            Grade / GPA: {edu.gpa}
                          </p>
                        )}
                        {edu.coursework && (
                          <p className="text-[11px] text-slate-500">
                            Coursework: {edu.coursework}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No education records available.</p>
                )}
              </div>

              {/* Skills Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Skills & Proficiencies
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {app.candidate.skills?.length ? (
                    app.candidate.skills.map((skill) => (
                      <span
                        key={skill.name}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700"
                      >
                        {skill.name}
                        {skill.level && (
                          <span className="text-[10px] text-blue-500">({skill.level.toLowerCase()})</span>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No verified skills listed</span>
                  )}
                </div>
              </div>

              {/* Platform Assessments */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Platform Assessments
                  </h4>
                </div>
                {app.assessmentSubmissions?.length ? (
                  <div className="divide-y divide-slate-100">
                    {app.assessmentSubmissions.map((sub) => (
                      <div key={sub.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-900">{sub.assessmentTitle}</p>
                          <p className="text-[11px] text-slate-400">
                            Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            sub.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-700 border border-slate-200'
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
            </div>

            {/* 7. Projects & Certifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Projects */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-indigo-600" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Projects & Portfolio
                  </h4>
                </div>
                {app.candidate.projects?.length ? (
                  <div className="space-y-4">
                    {app.candidate.projects.map((proj) => (
                      <div key={proj.id} className="text-xs space-y-1.5 border-l-2 border-indigo-200 pl-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900">{proj.title}</p>
                          {proj.role && (
                            <span className="text-[11px] text-slate-500">{proj.role}</span>
                          )}
                        </div>
                        {proj.description && (
                          <p className="text-[11px] text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {proj.description}
                          </p>
                        )}
                        {proj.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.technologies.map((t) => (
                              <span
                                key={t}
                                className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                          {proj.projectUrl && (
                            <a
                              href={proj.projectUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              Live Project <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-700 hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              GitHub Repository <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {proj.demoUrl && (
                            <a
                              href={proj.demoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              Demo <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No projects listed.</p>
                )}
              </div>

              {/* Certifications & Links */}
              <div className="space-y-6">
                {/* Certifications Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-600" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Certifications
                    </h4>
                  </div>
                  {app.candidate.certifications?.length ? (
                    <div className="space-y-3">
                      {app.candidate.certifications.map((cert) => (
                        <div key={cert.id} className="text-xs space-y-0.5 border-l-2 border-amber-200 pl-3">
                          <p className="font-semibold text-slate-900">{cert.name}</p>
                          <p className="text-slate-600">
                            {cert.issuingOrganization}
                            {cert.issueDate && ` • ${cert.issueDate}`}
                          </p>
                          {cert.credentialUrl && (
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline text-[11px] inline-flex items-center gap-1 pt-0.5"
                            >
                              View Credential <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No certifications listed.</p>
                  )}
                </div>

                {/* Professional Links Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Profile Links & Social
                    </h4>
                  </div>
                  {app.candidate.professionalLinks?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {app.candidate.professionalLinks.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                        >
                          <span>{link.platform}</span>
                          <ExternalLink className="h-3 w-3 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No professional links provided.</p>
                  )}
                </div>
              </div>
            </div>

            {/* 8. Scheduled Interviews for this Application */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Scheduled Interviews ({app.interviews?.length || 0})
                </h4>
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(true)}
                  className="text-xs font-semibold text-purple-700 hover:underline"
                >
                  + Schedule Interview
                </button>
              </div>
              {app.interviews && app.interviews.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {app.interviews.map((inv) => (
                    <div key={inv.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{inv.title}</p>
                        <p className="text-slate-500">
                          {new Date(inv.scheduledAt).toLocaleString()} • {inv.durationMinutes} mins • {inv.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-purple-50 border border-purple-200 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                          {inv.status}
                        </span>
                        {inv.meetingUrl && (
                          <a
                            href={inv.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                          >
                            Meeting Link <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No interview records for this application.</p>
              )}
            </div>

            {/* 9. Formal Job Offers */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Formal Offers ({app.offers?.length || 0})
                </h4>
                <button
                  type="button"
                  onClick={() => setShowOfferModal(true)}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  + Extend Offer
                </button>
              </div>
              {app.offers && app.offers.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {app.offers.map((off) => (
                    <div key={off.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{off.positionTitle}</p>
                        <p className="text-slate-500">
                          Salary: {off.currency} {off.salaryOffered.toLocaleString()} / year
                          {off.startDate && ` • Start Date: ${new Date(off.startDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                        {off.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No offer extended yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto my-auto">
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
                  <div className="relative mt-1">
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="appearance-none w-full rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="SCREENING">Screening</option>
                      <option value="TECHNICAL">Technical Round</option>
                      <option value="BEHAVIORAL">Behavioral</option>
                      <option value="CULTURE_FIT">Culture Fit</option>
                      <option value="FINAL">Final Executive Round</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
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
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updating ? 'Scheduling...' : 'Confirm Interview'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Extend Offer Modal */}
        {showOfferModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto my-auto">
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
                  <div className="relative mt-1">
                    <select
                      value={offerCurrency}
                      onChange={(e) => setOfferCurrency(e.target.value)}
                      className="appearance-none w-full rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
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
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {updating ? 'Sending...' : 'Send Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </RecruiterShell>
  );
}
